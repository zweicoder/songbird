const {
  getAllUserTracks,
  getRecentlyAddedTracks,
  getPopularTracks,
  getTopTracks,
  TIME_RANGE_OPTS,
} = require('../services/spotify/trackService.js');
const { getUserProfile } = require('../services/spotify/userService.js');
const {
  getPlaylistTracks,
  putPlaylistSongs,
  userHasPlaylist,
  updatePlaylistLastSynced,
} = require('../services/spotify/playlistService.js');
const { refreshAccessToken } = require('../services/spotify/oauth2Service.js');
const {
  getActiveSubscriptions,
  deleteSubscription,
  deleteSubscriptionByUserId,
} = require('../services/dbService.js');

async function syncSubscription(accessToken, subscription) {
  const {
    playlist_type: playlistType,
    spotify_playlist_id: spotifyPlaylistId,
    spotify_username: spotifyUserId,
    token: refreshToken,
  } = subscription;
  const { result: playlistExists } = await userHasPlaylist(
    accessToken,
    spotifyPlaylistId
  );
  if (!playlistExists) {
    console.log('Deleting stale subscription: ', subscription.id);
    await deleteSubscription(subscription.id);
    return;
  }
  const { result: tracks } = await getPlaylistTracks(accessToken, playlistType);

  await putPlaylistSongs(spotifyUserId, accessToken, spotifyPlaylistId, tracks);
  console.log('Successfully synced subscription: ', subscription.id);
}

async function main() {
  const { result: subscriptions } = await getActiveSubscriptions();
  // TODO window it ?
  for (let subscription of subscriptions) {
    const { token: refreshToken, user_id: userId, spotify_playlist_id: playlistId } = subscription;
    console.log('Syncing playlist for: ', subscription);
    try {
      const { result: accessToken } = await refreshAccessToken(refreshToken);
      // TODO this is super slow, need to balance rates vs speed
      // TODO update last synced in database
      await syncSubscription(accessToken, subscription);
      updatePlaylistLastSynced(userId, accessToken, playlistId);
    } catch(err) {
      // User revoked token
      if (err.response && err.response.data && err.response.data.error === 'invalid_grant') {
        console.log('Deleting revoked subscription of user: ', userId);
        await deleteSubscriptionByUserId(userId);
      } else {
        console.log('Unable to refresh token for subscription: ', subscription);
      }
      // Skip if anything goes wrong
      continue;
    }
  }
  console.log('Completed sync at :', new Date().toLocaleString());
  process.exit(0);
}

// Shittiest cli
const args = process.argv.slice(2);
if (args[0] === 'sync') {
  main();
}
