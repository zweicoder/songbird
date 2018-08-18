const { getUserProfile } = require('spotify-service/userService');
const {
  getAllUserTracks,
  preprocessTracks,
} = require('spotify-service/trackService');
const {
  getPlaylistTracks,
  putPlaylistSongs,
  userHasPlaylist,
  updatePlaylistLastSynced,
  makePlaylistBuilder,
} = require('spotify-service/playlistService');
const { refreshAccessToken } = require('../lib/oauthClient.js');
const {
  getActiveSubscriptions,
  deleteSubscription,
  deleteSubscriptionByUserId,
} = require('../services/dbService.js');
const logger = require('./logger.js');

const LRU = require('./lru.js');
const accessTokenCache = LRU(10000);
const trackCache = LRU(100);

async function syncSubscription(accessToken, subscription) {
  logger.info('Syncing playlist %o', subscription.id);
  const {
    playlist_config: playlistConfig,
    spotify_playlist_id: spotifyPlaylistId,
    spotify_username: spotifyUserId,
    token: refreshToken,
  } = subscription;
  const { result: playlistExists } = await userHasPlaylist(
    accessToken,
    spotifyPlaylistId
  );
  if (!playlistExists) {
    logger.info('Deleting stale subscription: %o', subscription.id);
    await deleteSubscription(subscription.id);
    return false;
  }
  let playlistTracks;
  if (playlistConfig.preset) {
    const builder = makePlaylistBuilder({ config: playlistConfig, accessToken });
    playlistTracks = await builder.build();
  } else {
    // Cache tracks cause it takes a lot more effort to get them
    if (!trackCache.get(spotifyUserId)) {
      logger.info('Processing user library...');
      const {result: tracks} = await getAllUserTracks(accessToken);
      const {result: processedTracks} = await preprocessTracks(accessToken, tracks);
      trackCache.set(spotifyUserId, processedTracks);
      logger.info('Processed %o tracks', processedTracks.length);
    }
    const userLibrary = trackCache.get(spotifyUserId);
    trackCache.set(spotifyUserId, userLibrary);
    const builder = makePlaylistBuilder({
      config: playlistConfig,
      accessToken,
    });
    playlistTracks = builder.build(userLibrary);
  }

  logger.info('Updating songs in playlist...');
  await putPlaylistSongs(
    spotifyUserId,
    accessToken,
    spotifyPlaylistId,
    playlistTracks
  );
  logger.info('Successfully synced subscription: %o', subscription.id);
  return true;
}

async function main() {
  const { result: subscriptions } = await getActiveSubscriptions();
  // TODO window it ?
  for (let subscription of subscriptions) {
    const {
      token: refreshToken,
      user_id: userId,
      spotify_playlist_id: playlistId,
    } = subscription;
    try {
      const { result: accessToken } = await refreshAccessToken(refreshToken);
      // TODO this is super slow, need to balance rates vs speed
      let success;
      success = await syncSubscription(accessToken, subscription);
      if (success) {
        logger.info(
          'Successfully synced playlist. Updating playlist description...'
        );
        await updatePlaylistLastSynced(userId, accessToken, playlistId);
      }
    } catch (err) {
      // User revoked token
      if (
        err.response &&
        err.response.data &&
        err.response.data.error === 'invalid_grant'
      ) {
        logger.info('Deleting revoked subscription of user: %o', userId);
        await deleteSubscriptionByUserId(userId);
      } else {
        logger.error(
          'Unable to refresh token for subscription: %o',
          subscription.id
        );
        logger.error(err.stack);
      }
      // Skip if anything goes wrong
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
