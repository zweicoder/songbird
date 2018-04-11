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
  deleteSubscription,
} = require('../services/spotify/playlistService.js');
const { refreshAccessToken } = require('../services/spotify/oauth2Service.js');
const { getActiveSubscriptions } = require('../services/dbService.js');

async function main() {
  const subscriptions = await getActiveSubscriptions();
  // TODO window it ?
  for (let subscription of subscriptions) {
    const {
      playlist_type: playlistType,
      spotify_playlist_id: spotifyPlaylistId,
      spotify_username: spotifyUserId,
      token: refreshToken,
    } = subscription;
    const { result: accessToken } = await refreshAccessToken(refreshToken);

    if (!userHasPlaylist(accessToken, spotifyPlaylistId)) {
      // TODO remove subscription
      await deleteSubscription(subscription.id);
      return;
    }
    const { result: tracks } = await getPlaylistTracks(accessToken, playlistType);

    await putPlaylistSongs(spotifyUserId, accessToken, spotifyPlaylistId, tracks);
  }
}

main();
