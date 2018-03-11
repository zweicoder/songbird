const axios = require('axios');
const { getOAuthHeader } = require('./oauthUtils.js');
const R = require('ramda');

const SPOTIFY_PLAYLIST_PUT_LIMIT = 100;
// Create
async function createPlaylist(userOpts, playlistOpts) {
  const { userId, accessToken } = userOpts;
  const { name, description } = playlistOpts;
  if (![name, description].every()) {
    return { err: 'Playlist metadata required!' };
  }

  const opts = {
    headers: getOAuthHeader(accessToken),
  };
  try {
    const res = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      opts,
      playlistOpts
    );
    const { id } = res.data;
    return { id };
  } catch (err) {
    console.error('Error while creating playlist for user: ');
    console.error(err.response.data.error);
    return { err };
  }
  return {};
}

// Delete or user PUT?
// Replace with PUT limit = 100 tracks / actually calculate diff (get all IDs, remove diff(left), add diff(right))
async function syncPlaylistSongs(userOpts, playlistId, tracks, limit = SPOTIFY_PLAYLIST_PUT_LIMIT) {
  const { userId, accessToken } = userOpts;
  const opts = {
    headers: getOAuthHeader(accessToken),
  };
  const getTrackUris = R.pipe(R.take(100), R.prop('uri'));
  const requestBody = {
    uris: getTrackUris(tracks)
  };
  try {
    const res = await axios.put(
      `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}`,
      opts,
      requestBody
    );
    return { };
  } catch (err) {
    console.error('Error while creating playlist for user: ');
    console.error(err.response.data.error);
    return { err };
  }
}

module.exports = {
  createPlaylist,
  syncPlaylistSongs,
};
