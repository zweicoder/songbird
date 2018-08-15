const axios = require('axios');
const R = require('ramda');
const moment = require('moment');

const makePlaylistBuilder = require('./builder.js');
const {
  getTopTracks,
  getRecentlyAddedTracks,
  getPopularTracks,
  TIME_RANGE_OPTS,
} = require('../trackService');
const { getOAuthHeader } = require('../oauth2Service');
const {
  PLAYLIST_TYPE_TOP_LONG_TERM,
  PLAYLIST_TYPE_TOP_MID_TERM,
  PLAYLIST_TYPE_TOP_SHORT_TERM,
  PLAYLIST_TYPE_POPULAR,
  PLAYLIST_TYPE_RECENT,
  PLAYLIST_METADATA,
} = require('./constants.js');

const SPOTIFY_PLAYLIST_PUT_LIMIT = 100;

const playlistToTimeRange = {
  [PLAYLIST_TYPE_TOP_LONG_TERM]: TIME_RANGE_OPTS.LONG_TERM,
  [PLAYLIST_TYPE_TOP_MID_TERM]: TIME_RANGE_OPTS.MEDIUM_TERM,
  [PLAYLIST_TYPE_TOP_SHORT_TERM]: TIME_RANGE_OPTS.SHORT_TERM,
};

/**
 * Gets the tracks for a given preset playlist type and user
 * @param string accessToken
 * @param enum playlistType - The playlist type shared between frontend and backend
 * @param int numTracks
 * @returns {err, result}
 */
async function getPlaylistTracks(accessToken, playlistType, numTracks = 25) {
  switch (playlistType) {
    case PLAYLIST_TYPE_TOP_SHORT_TERM:
    case PLAYLIST_TYPE_TOP_MID_TERM:
    case PLAYLIST_TYPE_TOP_LONG_TERM:
      const timeRange = playlistToTimeRange[playlistType];
      return await getTopTracks(accessToken, timeRange, { limit: numTracks });
    case PLAYLIST_TYPE_RECENT:
      return await getRecentlyAddedTracks(accessToken, { limit: numTracks });
    case PLAYLIST_TYPE_POPULAR:
      return await getPopularTracks(accessToken, { limit: numTracks });
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
async function createEmptyPlaylist(userId, accessToken, playlistOpts) {
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
  userId,
  accessToken,
  playlistId,
  tracks,
  limit = SPOTIFY_PLAYLIST_PUT_LIMIT
) {
  const opts = {
    headers: getOAuthHeader(accessToken),
  };
  const getTrackUri = R.pipe(R.prop('uri'));
  const getTrackUris = R.pipe(
    R.take(limit),
    R.map(getTrackUri)
  );
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

// https://developer.spotify.com/documentation/web-api/reference/playlists/change-playlist-details/
async function putPlaylistDetails(
  userId,
  accessToken,
  playlistId,
  playlistDetails
) {
  const opts = {
    headers: getOAuthHeader(accessToken),
  };
  try {
    const res = await axios.put(
      `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}`,
      playlistDetails,
      opts
    );
    return {};
  } catch (err) {
    console.error(`Error while updating playlist details for ${playlistId}: `);
    console.error(err.config);
    console.error(err.response.status);
    console.error(err.response.data);
    throw err;
  }
}

async function updatePlaylistLastSynced(userId, accessToken, playlistId) {
  const playlistDetails = {
    description: `Generated by Songbird | Last synced: ${moment().format(
      'LL'
    )}`,
  };
  await putPlaylistDetails(userId, accessToken, playlistId, playlistDetails);
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
    const { result } = await _getUserPlaylists(accessToken, {
      offset: i,
      limit,
    });
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
  return { result: playlistIds && playlistIds.includes(playlistId) };
}

// TODO something will go wrong with create react app?
module.exports = {
  // Constants
  PLAYLIST_TYPE_TOP_SHORT_TERM,
  PLAYLIST_TYPE_TOP_MID_TERM,
  PLAYLIST_TYPE_TOP_LONG_TERM,
  PLAYLIST_TYPE_POPULAR,
  PLAYLIST_TYPE_RECENT,
  PLAYLIST_METADATA,

  // Functions
  createEmptyPlaylist,
  putPlaylistSongs,
  getPlaylistTracks,
  getPlaylist,
  getAllUserPlaylists,
  userHasPlaylist,
  updatePlaylistLastSynced,

  makePlaylistBuilder,
};
