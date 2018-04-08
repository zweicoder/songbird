const R = require('ramda');
const axios = require('axios');
const qs = require('query-string');
const { getOAuthHeader } = require('../../lib/oauthUtils.js');

const SPOTIFY_ENDPOINT_TRACKS = 'https://api.spotify.com/v1/me/tracks';
const SPOTIFY_ENDPOINT_TOP = 'https://api.spotify.com/v1/me/top/tracks';
// 4 weeks, 6 months, years
const TIME_RANGE_OPTS = {
  SHORT_TERM: 'short_term',
  MEDIUM_TERM: 'medium_term',
  LONG_TERM: 'long_term',
};

const popularitySelector = trackObj => trackObj.popularity;
const addedTimeSelector = trackObj => trackObj.added_at;

// Get Most Popular tracks from the trackObjs.
function _getPopularTracks(trackObjs, limit = 50) {
  const sortByPopularityDesc = R.sortBy(R.pipe(popularitySelector, R.negate));
  const topResults = R.pipe(sortByPopularityDesc, R.take(limit));
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
async function _getUserTracks(userOpts, { offset = 0, limit = 50 }) {
  const { accessToken } = userOpts;
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
    const tracks = savedTrackObjs.map(({ added_at, track }) =>
      Object.assign({}, track, { added_at })
    );
    return {
      result: {
        next: res.data.next,
        tracks,
      },
    };
  } catch (err) {
    console.error('Error while requesting for user tracks: ');
    console.error(err.config);
    console.error(err.response.status);
    console.error(err.response.data);
    throw err;
  }
}

// Gets all user tracks. Tracks returned here are 'saved track objects' with a `created_at` field
async function getAllUserTracks(userOpts, maxLimit = 250) {
  // Request by the maximum number of tracks per request
  const limit = 50;
  const allTracks = [];

  // Default maxLimit limits per user to request up to 5 times
  for (let i = 0; i < maxLimit; i += limit) {
    const { result } = await _getUserTracks(userOpts, { offset: i, limit });
    const { next, tracks } = result;
    allTracks.push(...tracks);
    if (!next) {
      break;
    }
  }
  return { result: allTracks };
}

// Get Top tracks of user based on given time range
async function getTopTracks(userOpts, timeRange, { limit = 50, offset = 0 }) {
  const { accessToken } = userOpts;
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
  } catch (err) {
    console.error('Error while getting top tracks');
    console.error(err.config);
    console.error(err.response.status);
    console.error(err.response.data);
    throw err;
  }
}

// Get Most Recently Added tracks
async function getRecentlyAddedTracks(userOpts, { limit = 50 }) {
  const { result } = await _getUserTracks(userOpts, { limit });
  return { result: result.tracks };
}

module.exports = {
  getAllUserTracks,
  getRecentlyAddedTracks,
  getTopTracks,
  TIME_RANGE_OPTS,
};
