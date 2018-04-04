const axios = require('axios');
const R = require('ramda');

const { getTopTracks, TIME_RANGE_OPTS } = require('./trackService.js');
const { getOAuthHeader } = require('../../lib/oauthUtils.js');
const {
  PLAYLIST_TYPE_TOP_SHORT_TERM,
  PLAYLIST_TYPE_TOP_MID_TERM,
  PLAYLIST_TYPE_TOP_LONG_TERM,
  PLAYLIST_TYPE_POPULAR,
} = require('../../constants.global.js');

const SPOTIFY_PLAYLIST_PUT_LIMIT = 100;

const playlistToTimeRange = {
  [PLAYLIST_TYPE_TOP_LONG_TERM]: TIME_RANGE_OPTS.LONG_TERM,
  [PLAYLIST_TYPE_TOP_MID_TERM]: TIME_RANGE_OPTS.MEDIUM_TERM,
  [PLAYLIST_TYPE_TOP_SHORT_TERM]: TIME_RANGE_OPTS.SHORT_TERM,
};

/**
 * Gets the tracks for a given playlist type and user
 * @param {userId, accessToken} userOpts
 * @param enum playlistType - The playlist type shared between frontend and backend
 * @param int numTracks
 * @returns {err, result}
 */
async function getPlaylistTracks(userOpts, playlistType, numTracks = 25) {
  switch (playlistType) {
    case PLAYLIST_TYPE_TOP_SHORT_TERM:
    case PLAYLIST_TYPE_TOP_MID_TERM:
    case PLAYLIST_TYPE_TOP_LONG_TERM:
      const timeRange = playlistToTimeRange[playlistType];
      const { result, err } = await getTopTracks(
        userOpts,
        timeRange,
        numTracks
      );
      if (err) {
        return { err };
      }
      return { result };
    // TODO other playlist types
    default:
      throw new Error('No matching playlist types for: ', playlistType);
  }
}

/**
 * Creates an empty playlist for a user
 * @param {userId, accessToken} userOpts
 * @param {name, description} playlistOpts
 * @returns {err, result}
 */
async function createEmptyPlaylist(userOpts, playlistOpts) {
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
    return { result: id };
  } catch (err) {
    console.error('Error while creating playlist for user: ');
    console.error(err.config);
    console.error(err.response.status);
    console.error(err.response.data);
    throw err;
  }
  return {};
}

// Replace with PUT limit = 100 tracks / actually calculate diff (get all IDs, remove diff(left), add diff(right))
async function putPlaylistSongs(
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
    return { err: 'Bad track uris: ' + requestBody.uris };
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
    console.error(err.config);
    console.error(err.response.status);
    console.error(err.response.data);
    throw err;
  }
}

module.exports = {
  createEmptyPlaylist,
  putPlaylistSongs,
  getPlaylistTracks,
};
