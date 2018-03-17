const R = require('ramda');
const axios = require('axios');
const qs = require('query-string');
const { getOAuthHeader } = require('./oauthUtils.js');

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

// Get Top tracks of user based on given time range
async function getTopTracks(
  userOpts,
  timeRange,
  limit = 50,
  offset = 0
) {
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
    const items = res.data.items;
    return { result: items };
  } catch (err) {
    console.error('Error while requesting for user top tracks: ');
    console.error(err.response.data.error);
    return { err };
  }
}

// Get Most Popular tracks from the trackObjs.
function getPopularTracks(trackObjs, limit = 50) {
  const sortByPopularityDesc = R.sortBy(R.pipe(popularitySelector, R.negate));
  const topResults = R.pipe(sortByPopularityDesc, R.take(limit));
  return topResults(trackObjs);
}

// Get Most Recently Added tracks
function getRecentlyAddedTracks(trackObjs, limit = 50) {
  if (trackObjs.any(e => !e.created_at)) {
    console.error('Track with no created_at field found. Make sure track is from a saved track object');
    return {err: 'Bad input to function'};
  }
  const sortByAddedTimeDesc = R.sortBy(
    R.pipe(addedTimeSelector, Date.parse, R.negate)
  );
  const topResults = R.pipe(sortByAddedTimeDesc, R.take(limit));
  return topResults(trackObjs);
}

// Get tracks added before a certain time. Limit??
function getTracksByTimeWindow(trackObjs, timeDeltaInMillis) {
  // TODO maybe not Date.now but a set time (e.g. sunday 12am)
  if (trackObjs.any(e => !e.created_at)) {
    console.error('Track with no created_at field found. Make sure track is from a saved track object');
    return {err: 'Bad input to function'};
  }
  const cutOffDatetime = Date.now() - timeDeltaInMillis;
  const isAddedBeforeCutOff = R.pipe(
    addedTimeSelector,
    createdAt => createdAt < cutOffDatetime
  );
  const filterTracksByTime = R.filter(isAddedBeforeCutOff);
  return filterTracksByTime(trackObjs);
}

async function getUserTracks(userOpts, { offset = 0, limit = 50 }) {
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
    const items = res.data.items;
    return {
      next: res.data.next,
      items,
    };
  } catch (err) {
    console.error('Error while requesting for user tracks: ');
    console.error(err.response.data.error);
    return { err };
  }
}

// Gets all user tracks. Tracks returned here are 'saved track objects' with a `created_at` field
async function getAllUserTracks(accessToken, maxLimit = 250) {
  // Request by the maximum number of tracks per request
  const limit = 50;
  const savedTrackObjs = [];

  // Default maxLimit limits per user to request up to 5 times
  for (let i = 0; i < maxLimit; i += limit) {
    const res = await getUserTracks(accessToken, { offset: i, limit });
    const {err, items } = res;
    if (res.err) return {err: res.err};
    savedTrackObjs.push(...res.items);
    if (!res.next) {
      break;
    }
  }

  const tracks = savedTrackObjs.map(({added_at, track}) => Object.assign({}, track, {added_at}));
  return { result: tracks };
}

module.exports = {
  getAllUserTracks,
  getRecentlyAddedTracks,
  getPopularTracks,
  getTopTracks,
  TIME_RANGE_OPTS,
};
