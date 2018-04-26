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
} = require('../services/spotify/playlistService.js');
const { refreshAccessToken } = require('../services/spotify/oauth2Service.js');
const {
  getActiveSubscriptions,
  deleteSubscription,
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
    const { token: refreshToken } = subscription;
    const { result: accessToken } = await refreshAccessToken(refreshToken);
    // TODO this is super slow, need to balance rates vs speed
    await syncSubscription(accessToken, subscription);
  }
  console.log('Completed sync at :', new Date().toLocaleString());
  process.exit(0);
}

main();
