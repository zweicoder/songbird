const R = require('ramda');

const { getUserProfile } = require('spotify-service').userService;
const {
  getAllUserTracks,
  preprocessTracks,
} = require('spotify-service').trackService;
const {
  getPlaylistTracks,
  putPlaylistSongs,
  userHasPlaylist,
  updatePlaylistLastSynced,
  makePlaylistBuilder,
  getStalePlaylists,
} = require('spotify-service').playlistService;

const { stripe, isSubscriptionActive } = require('../services/stripeService.js');
const {
  PLAYLIST_LIMIT_HARD_CAP,
  PLAYLIST_LIMIT_BASIC,
} = require('../constants.global.js');
const { refreshAccessToken } = require('../lib/oauthClient.js');
const {
  getActiveSubscriptions,
  deleteSubscriptionById,
  deleteSubscriptionsById,
  deleteSubscriptionByUserId,
  getUserByToken,
} = require('../services/dbService.js');
const logger = require('./logger.js');

// Assumes subscriptions are grouped by user. Otherwise use global LRU cache.
async function syncSubscriptions(accessToken, subscriptions) {
  let userLibrary;
  async function doSyncSubscription(subscription) {
    logger.info('Syncing subscription %o...', subscription.id);
    logger.info('Config: %o', subscription.playlist_config);
    const {
      playlist_config: playlistConfig,
      spotify_playlist_id: spotifyPlaylistId,
      spotify_username: spotifyUserId,
      token: refreshToken,
    } = subscription;
    let playlistTracks;
    if (playlistConfig.preset) {
      const builder = makePlaylistBuilder({
        config: playlistConfig,
        accessToken,
      });
      playlistTracks = await builder.build();
    } else {
      // Cache tracks cause it takes a lot more effort to get them
      // Cache is only scoped in parent function. Use global LRU cache if need to share across other instances.
      if (!userLibrary) {
        logger.info('Processing user library...');
        const { result: tracks } = await getAllUserTracks(accessToken);
        const { result: processedTracks } = await preprocessTracks(
          accessToken,
          tracks
        );
        userLibrary = processedTracks;
        logger.info('Processed %o tracks', processedTracks.length);
      }
      const builder = makePlaylistBuilder({
        config: playlistConfig,
        accessToken,
      });
      playlistTracks = await builder.build(userLibrary);
    }

    logger.info('Updating songs in playlist...');
    await putPlaylistSongs(
      spotifyUserId,
      accessToken,
      spotifyPlaylistId,
      playlistTracks
    );
    logger.info('Successfully updated subscription: %o', subscription.id);
  }

  for (let subscription of subscriptions) {
    try {
      await doSyncSubscription(subscription);
    } catch (err) {
      if (err.response && err.response.status === 429) {
        // TODO rate limited exceeded
        logger.warn('API Rate limit exceeded while syncing');
        logger.warn('Headers: %o', err.response.headers);
        logger.warn('Retry-After: %o', err.response.headers['Retry-After']);
        continue;
      }
      logger.error('Error while syncing subscription %o:', subscription);
      logger.error(err.stack);
      logger.error('Aborting!');
      continue;
    }
  }
}

// TODO send to another queue if 429
async function main() {
  const { result: subscriptions } = await getActiveSubscriptions();
  const groupSubscriptionByUsers = R.pipe(
    R.groupBy(sub => sub.user_id),
    R.toPairs
  );
  const groups = groupSubscriptionByUsers(subscriptions);
  for (let group of groups) {
    try {
      const [userId, subscriptions] = group;
      const { spotify_username, token: refreshToken } = subscriptions[0];
      logger.info('Syncing for user %o...', spotify_username);
      const { result: accessToken, err } = await refreshAccessToken(
        refreshToken
      );
      if (err && err === 'invalid_grant') {
        logger.info(
          'Token has been revoked by user. Invalidating subscriptions...'
        );
        deleteSubscriptionByUserId(userId);
        logger.info('Deleted subscriptions by %o', userId);
        continue;
      }

      // Token is still active
      // Check if playlists are already deleted
      const {
        result: { active, stale },
      } = await getStalePlaylists(accessToken, subscriptions);

      // Delete any stale subscriptions
      if (stale.length) {
        logger.info('Deleting %o stale subscriptions', stale.length);
        deleteSubscriptionsById(stale.map(e => e.id));
      }

      // Check if premium user if too many playlists
      let subsToSync = active;
      logger.info(`User: ${spotify_username} | active: ${active.length}`);
      // User exceeded basic user's limit
      if (active.length >= PLAYLIST_LIMIT_BASIC) {
        if (active.length >= PLAYLIST_LIMIT_HARD_CAP) {
          logger.info('User exceeded hard cap!!!');
          subsToSync = subsToSync.slice(0, PLAYLIST_LIMIT_HARD_CAP);
        }

        // Check with stripe to see if subscription still pseudo-active
        const { result: dbUser } = await getUserByToken(refreshToken);
        const stillAlive = await isSubscriptionActive(dbUser.stripe_sub_id);
        if (!stillAlive) {
          logger.info('User is not premium!');
          subsToSync = subsToSync.slice(0, PLAYLIST_LIMIT_BASIC);
        }
      }

      // Sync based on limits
      await syncSubscriptions(accessToken, subsToSync);
      logger.info('Updating playlist last synced...');
      await Promise.all(subsToSync.map(e=> updatePlaylistLastSynced(spotify_username, accessToken, e.spotify_playlist_id)));
      logger.info('Successfully updated all subscriptions for %o', spotify_username);
    } catch (err) {
      const [userId, _subscriptions] = group;
      if (err.response && err.response.status === 429) {
        // TODO rate limited exceeded
        logger.warn('API Rate limit exceeded while syncing for user: %o', userId);
        logger.warn('Headers: %o', err.response.headers);
        logger.warn('Retry-After: %o', err.response.headers['Retry-After']);
        continue;
      }
      logger.error('Uncaught error while syncing for %o', userId);
      logger.error(err.stack);
      continue;
    }
  }
  logger.info('Completed sync at : %o', new Date().toLocaleString());
  process.exit(0);
}

// Shittiest cli
const args = process.argv.slice(2);
if (args[0] === 'sync') {
  main();
}
