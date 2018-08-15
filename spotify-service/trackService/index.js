const R = require('ramda');
const axios = require('axios');
const qs = require('query-string');
const moment = require('moment');

const { preprocessTracks } = require('./preprocess.js');
const { getOAuthHeader } = require('../oauth2Service');
const {
  PLAYLIST_TYPE_TOP_LONG_TERM,
  PLAYLIST_TYPE_TOP_MID_TERM,
  PLAYLIST_TYPE_TOP_SHORT_TERM,
  PLAYLIST_TYPE_POPULAR,
  PLAYLIST_TYPE_RECENT,
  TIME_RANGE_OPTS,
} = require('./constants.js');

const SPOTIFY_ENDPOINT_TRACKS = 'https://api.spotify.com/v1/me/tracks';
const SPOTIFY_ENDPOINT_TOP = 'https://api.spotify.com/v1/me/top/tracks';

const popularitySelector = trackObj => trackObj.popularity;
const addedTimeSelector = trackObj => trackObj.added_at;

// Get Most Popular tracks from the trackObjs.
function _getPopularTracks(trackObjs, limit = 50) {
  const sortByPopularityDesc = R.sortBy(
    R.pipe(
      popularitySelector,
      R.negate
    )
  );
  const topResults = R.pipe(
    sortByPopularityDesc,
    R.take(limit)
  );
  return topResults(trackObjs);
}

// Get tracks added before a certain time. Limit??
function _getTracksByTimeWindow(trackObjs, timeDeltaInMillis) {
  // TODO maybe not Date.now but a set time (e.g. sunday 12am)
  if (trackObjs.any(e => !e.created_at)) {
    console.error(
      'Track with no created_at field found. Make sure track is from a saved track object'
    );
    return { err: 'Bad input to function' };
  }
  const cutOffDatetime = Date.now() - timeDeltaInMillis;
  const isAddedBeforeCutOff = R.pipe(
    addedTimeSelector,
    createdAt => createdAt < cutOffDatetime
  );
  const filterTracksByTime = R.filter(isAddedBeforeCutOff);
  return filterTracksByTime(trackObjs);
}

// Helper method to get user tracks, returns the uri for getting next set of tracks on top of requested tracks
async function getPagedUserTracks(accessToken, { offset = 0, limit = 50 }) {
  const queryParams = qs.stringify({
    limit,
    offset,
  });
  const options = {
    headers: getOAuthHeader(accessToken),
  };

  try {
    const res = await axios.get(
      `${SPOTIFY_ENDPOINT_TRACKS}?${queryParams}`,
      options
    );
    const savedTrackObjs = res.data.items;
    // Merge added_at into track obj
    const tracks = savedTrackObjs.map(({ added_at, track }) =>
      Object.assign({}, track, { added_at })
    );
    // Filter away tracks that are basically empty (e.g. redacted content / japnese songs)
    const filteredTracks = tracks.filter(e => e.name !== '');
    return {
      result: {
        next: res.data.next,
        tracks,
        total: res.data.total,
      },
    };
  } catch (error) {
    return { error };
  }
}

// Gets all user tracks. Tracks returned here are 'saved track objects' with a `created_at` field
// Progress is passed into a callbackFn, if defined. CallbackFn should return true/ false to determine whether
// function should continue to execute, or end early.
// FIXME this actually always returns by multiples of 50, so if max limit is 99 it still returns 100. Not impt tho
async function getAllUserTracks(accessToken, { maxLimit = 250, callbackFn }) {
  // Request by the maximum number of tracks per request
  const limit = Math.min(50, maxLimit);
  const allTracks = [];

  // Default maxLimit limits per user to request up to 5 times
  for (let i = 0; i < maxLimit; i += limit) {
    const { result } = await getPagedUserTracks(accessToken, {
      offset: i,
      limit,
    });
    const { next, tracks, total } = result;
    allTracks.push(...tracks);
    if (callbackFn) {
      const opts = { numTracks: allTracks.length, total };
      const shouldContinue = callbackFn(opts);
      if (!shouldContinue) {
        break;
      }
    }
    if (!next) {
      break;
    }
  }

  return { result: allTracks };
}

// Get Top tracks of user based on given time range
async function getTopTracks(
  accessToken,
  timeRange,
  { limit = 50, offset = 0 }
) {
  const queryParams = qs.stringify({
    time_range: timeRange,
    limit,
    offset,
  });
  const options = {
    headers: Object.assign(
      {},
      { 'Content-Type': 'application/json' },
      getOAuthHeader(accessToken)
    ),
  };

  try {
    const res = await axios.get(
      `${SPOTIFY_ENDPOINT_TOP}?${queryParams}`,
      options
    );
    const tracks = res.data.items;
    return { result: tracks };
  } catch (error) {
    return { error };
  }
}

// Get Most Recently Added tracks
async function getRecentlyAddedTracks(accessToken, { limit = 50 }) {
  const { result } = await getPagedUserTracks(accessToken, { limit });
  return { result: result.tracks };
}

async function getPopularTracks(accessToken, { limit = 50 }) {
  const { result: trackObjs } = await getAllUserTracks(accessToken);
  const popularTracks = _getPopularTracks(trackObjs, limit);
  return { result: popularTracks };
}

// 4 weeks, 6 months, years
// For getTopTracks
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
async function getPresetTracks(accessToken, playlistType, numTracks = 25) {
  switch (playlistType) {
    case PLAYLIST_TYPE_TOP_SHORT_TERM:
    case PLAYLIST_TYPE_TOP_MID_TERM:
    case PLAYLIST_TYPE_TOP_LONG_TERM:
      const timeRange = playlistToTimeRange[playlistType];
      return await getTopTracks(accessToken, timeRange, { limit: numTracks });
      // TODO deprecate soon with builder
    case PLAYLIST_TYPE_RECENT:
      return await getRecentlyAddedTracks(accessToken, { limit: numTracks });
    case PLAYLIST_TYPE_POPULAR:
      return await getPopularTracks(accessToken, { limit: numTracks });
    default:
      throw new Error(`No matching playlist types for: ${playlistType}`);
  }
}

module.exports = {
  getPagedUserTracks,
  getAllUserTracks,
  getRecentlyAddedTracks,
  getTopTracks,
  getPopularTracks,
  preprocessTracks,
  getPresetTracks,
};
