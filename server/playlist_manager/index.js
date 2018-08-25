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
const { refreshAccessToken } = require('../lib/oauthClient.js');
const {
  getActiveSubscriptions,
  deleteSubscriptionById,
  deleteSubscriptionsById,
  deleteSubscriptionByUserId,
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
      logger.error('Error while syncing subscription %o:', subscription);
      logger.error(err.stack);
      logger.error('Aborting!');
      continue;
    }
  }
}

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
        deleteSubscriptionsById(stale.map(e=>e.id));
      }

      logger.info('Found %o active subscriptions', active.length);
      await syncSubscriptions(accessToken, active);
    } catch (err) {
      logger.error('Error while syncing for %o', group);
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
