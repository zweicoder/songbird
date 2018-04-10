const axios = require('axios');
const R = require('ramda');

const {
  getTopTracks,
  getRecentlyAddedTracks,
  TIME_RANGE_OPTS,
} = require('./trackService.js');
const { getOAuthHeader } = require('../../lib/oauthUtils.js');
const {
  PLAYLIST_TYPE_TOP_SHORT_TERM,
  PLAYLIST_TYPE_TOP_MID_TERM,
  PLAYLIST_TYPE_TOP_LONG_TERM,
  PLAYLIST_TYPE_RECENT,
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
      return await getTopTracks(userOpts, timeRange, { limit: numTracks });
    case PLAYLIST_TYPE_RECENT:
      return await getRecentlyAddedTracks(userOpts, { limit: numTracks });
    default:
      throw new Error(`No matching playlist types for: ${playlistType}`);
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

// Retrieves playlist with given spotify playlist ID. Not really used
async function getPlaylist(userId, accessToken, playlistId) {
  const opts = {
    headers: getOAuthHeader(accessToken),
  };
  try {
    const res = await axios.get(
      `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}`,
      opts
    );
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Error while syncing playlist for user: ');
    console.error(err.config);
    console.error(err.response.status);
    console.error(err.response.data);
    throw err;
  }
}

// Retrieves a list of user's playlists. Gets a paged object
// Currently uses the current user method, instead of calling with server's accessToken
async function _getUserPlaylists(accessToken, { offset = 0, limit = 50 }) {
  const opts = {
    headers: getOAuthHeader(accessToken),
  };
  try {
    const res = await axios.get(
      'https://api.spotify.com/v1/me/playlists',
      opts
    );
    const { next, items: playlists } = res.data;
    return { result: { next, playlists } };
  } catch (err) {
    console.error('Error while syncing playlist for user: ');
    console.error(err.config);
    console.error(err.response.status);
    console.error(err.response.data);
    throw err;
  }
}

async function getAllUserPlaylists(accessToken, maxLimit = 250) {
  const limit = 50;
  const allPlaylists = [];

  // Default maxLimit limits per user to request up to 5 times
  for (let i = 0; i < maxLimit; i += limit) {
    const { result } = await _getUserPlaylists(accessToken, { offset: i, limit });
    const { next, playlists } = result;
    allPlaylists.push(...playlists);
    if (!next) {
      break;
    }
  }
  return { result: allPlaylists };
}

async function userHasPlaylist(accessToken, playlistId) {
  const { result: playlists } = await getAllUserPlaylists(accessToken);
  const playlistIds = playlists.map(e => e.id);
  return playlistIds && playlistIds.includes(playlistId);
}

module.exports = {
  createEmptyPlaylist,
  putPlaylistSongs,
  getPlaylistTracks,
  getPlaylist,
  getAllUserPlaylists,
  userHasPlaylist,
};
