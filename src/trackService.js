const R = require('ramda');
const axios = require('axios');
const qs = require('query-string');
const { getOAuthHeader } = require('./oauthUtils.js');

const SPOTIFY_ENDPOINT_TRACKS = 'https://api.spotify.com/v1/me/tracks';

const popularitySelector = trackObj => trackObj.track.popularity;
const addedTimeSelector = trackObj => trackObj.added_at;

// Get Most Popular tracks from the trackObjs
function getPopularTracks(trackObjs, limit = 50) {
  const sortByPopularityDesc = R.sortBy(R.pipe(popularitySelector, R.negate));
  const topResults = R.pipe(sortByPopularityDesc, R.take(limit));
  return topResults(trackObjs);
}

// Get Most Recently Added tracks
function getRecentlyAddedTracks(trackObjs, limit = 50) {
  const sortByAddedTimeDesc = R.sortBy(
    R.pipe(addedTimeSelector, Date.parse, R.negate)
  );
  const topResults = R.pipe(sortByAddedTimeDesc, R.take(limit));
  return topResults(trackObjs);
}

// Get tracks added before a certain time. Limit??
function getTracksByTimeWindow(trackObjs, timeDeltaInMillis) {
  // TODO maybe not Date.now but a set time (e.g. sunday 12am)
  const cutOffDatetime = Date.now() - timeDeltaInMillis;
  const isAddedBeforeCutOff = R.pipe(
    addedTimeSelector,
    createdAt => createdAt < cutOffDatetime
  );
  const filterTracksByTime = R.filter(isAddedBeforeCutOff);
  return filterTracksByTime(trackObjs);
}

function pluckFromTracks({ id, name, popularity, artists }) {
  return { id, name, popularity, artists };
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
    // console.log(
    //   `Requesting for tracks... ${SPOTIFY_ENDPOINT_TRACKS}?${queryParams}`
    // );
    const res = await axios.get(
      `${SPOTIFY_ENDPOINT_TRACKS}?${queryParams}`,
      options
    );
    const items = res.data.items.map(({ added_at, track }) => {
      return { added_at, track: pluckFromTracks(track) };
    });
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

async function getAllUserTracks(accessToken, maxLimit = 250) {
  // Request by the maximum number of tracks per request
  const limit = 50;
  const allItems = [];

  // Default maxLimit limits per user to request up to 5 times
  for (let i = 0; i < maxLimit; i += limit) {
    const res = await getUserTracks(accessToken, { offset: i, limit });
    allItems.push(...res.items);
    if (!res.next) {
      break;
    }
  }
  return allItems;
}

module.exports = {
  getAllUserTracks,
  getRecentlyAddedTracks,
  getPopularTracks,
};
