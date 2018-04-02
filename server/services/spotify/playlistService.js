const axios = require('axios');
const R = require('ramda');

const { getOAuthHeader } = require('../../lib/oauthUtils.js');

const SPOTIFY_PLAYLIST_PUT_LIMIT = 100;

async function createPlaylist(userOpts, playlistOpts) {
  const { userId, accessToken } = userOpts;
  const { name, description } = playlistOpts;
  if (![name, description].every(e => !!e)) {
    return { err: 'Playlist metadata required!' };
  }

  const opts = {
    headers: getOAuthHeader(accessToken),
  };
  try {
    const res = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      playlistOpts,
      opts
    );
    const { id } = res.data;
    return { id };
  } catch (err) {
    console.error('Error while creating playlist for user: ');
    console.error(err.response.data.error);
    throw err;
  }
  return {};
}

// Replace with PUT limit = 100 tracks / actually calculate diff (get all IDs, remove diff(left), add diff(right))
async function syncPlaylistSongs(
  userOpts,
  playlistId,
  tracks,
  limit = SPOTIFY_PLAYLIST_PUT_LIMIT
) {
  const { userId, accessToken } = userOpts;
  const opts = {
    headers: getOAuthHeader(accessToken),
  };
  const getTrackUri = R.pipe(R.prop('uri'));
  const getTrackUris = R.pipe(R.take(limit), R.map(getTrackUri));
  const requestBody = {
    uris: getTrackUris(tracks),
  };
  if (!requestBody.uris.every(e => !!e)) {
    console.error('Bad track uris: ', requestBody.uris);
    return {err: 'Bad track uris: ' + requestBody.uris};
  }
  try {
    const res = await axios.put(
      `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
      requestBody,
      opts
    );
    return {};
  } catch (err) {
    console.error('Error while syncing playlist for user: ');
    console.error(err.response.data.error);
    throw err;
  }
}

module.exports = {
  createPlaylist,
  syncPlaylistSongs,
};
