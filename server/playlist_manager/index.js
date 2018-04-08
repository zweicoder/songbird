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
} = require('../services/spotify/playlistService.js');
const { refreshAccessToken } = require('../services/spotify/oauth2Service.js');
const { getActiveSubscriptions } = require('../services/dbService.js');

async function main() {
  const subscriptions = await getActiveSubscriptions();
  // TODO window it ?
  for (let subscription of subscriptions) {
    // TODO join for token
    const {
      playlist_type: playlistType,
      spotify_playlist_id: spotifyPlaylistId,
      spotify_username: spotifyUserId,
      token: refreshToken,
    } = subscriptions;
    const { result: accessToken } = await refreshAccessToken(refreshToken);

    // TODO check playlist deleted
    const userOpts = {
      userId: spotifyUserId,
      accessToken,
    };
    const { result: tracks } = await getPlaylistTracks(userOpts, playlistType);

    await putPlaylistSongs(userOpts, spotifyPlaylistId, tracks);
  }
}

main();
