const { getUserProfile } = require('spotify-service/userService');
const {
  getAllUserTracks,
  getRecentlyAddedTracks,
  getPopularTracks,
  getTopTracks,
  TIME_RANGE_OPTS,
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

const R = require('ramda');
// TEMPORARY, moving towards custom playlists
const PLAYLIST_TYPE_DB_MAP = {
  PLAYLIST_TYPE_TOP_SHORT_TERM: 0,
  PLAYLIST_TYPE_TOP_MID_TERM: 1,
  PLAYLIST_TYPE_TOP_LONG_TERM: 2,
  PLAYLIST_TYPE_POPULAR: 3,
  PLAYLIST_TYPE_RECENT: 4,
};

const PLAYLIST_TYPE_DB_REVERSE_MAP = R.invertObj(PLAYLIST_TYPE_DB_MAP);

async function syncSubscription(accessToken, subscription) {
  logger.info('Syncing playlist for: %o', subscription);
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
  let builder;
  if (playlistConfig.preset) {
    builder = makePlaylistBuilder({config: playlistConfig, accessToken});
  } else {
    const userLibrary = await getAllUserTracks(accessToken);
    builder = makePlaylistBuilder({config: playlistConfig, accessToken, tracks: userLibrary});
  }
  const playlistTracks = await builder.build();

  await putPlaylistSongs(spotifyUserId, accessToken, spotifyPlaylistId, playlistTracks);
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
        logger.info('Successfully synced playlist. Updating playlist description...');
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
        logger.error('Unable to refresh token for subscription: %o', subscription);
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
