const R = require('ramda');
const axios = require('axios');
const qs = require('query-string');
const moment = require('moment');
const { getOAuthHeader } = require('../oauth2Service');

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
async function _getUserTracks(accessToken, { offset = 0, limit = 50 }) {
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
  } catch (error) {
    return { error };
  }
}

// Gets all user tracks. Tracks returned here are 'saved track objects' with a `created_at` field
async function getAllUserTracks(accessToken, maxLimit = 250) {
  // Request by the maximum number of tracks per request
  const limit = 50;
  const allTracks = [];

  // Default maxLimit limits per user to request up to 5 times
  for (let i = 0; i < maxLimit; i += limit) {
    const { result } = await _getUserTracks(accessToken, { offset: i, limit });
    const { next, tracks } = result;
    allTracks.push(...tracks);
    if (!next) {
      break;
    }
  }

  return { result: allTracks };
}
function window(arr, size) {
  const windows = [];
  for (let i= 0; i< arr.length; i+=size) {
    windows.push(arr.slice(i, i+size));
  }
  return windows;
}

async function getDetailsOfAlbums(accessToken, albumIds){
  function _getDetails(ids) {
    const queryParams = qs.stringify({
      // Manually join ourselves because most libraries just do `ids=1&ids=2` etc which might not work
      ids: ids.join(','),
    });
    const options = {
      headers: Object.assign(
        {},
        { 'Content-Type': 'application/json' },
        getOAuthHeader(accessToken)
      ),
    };
    return new Promise((resolve, reject) => {
      return axios
        .get(`https://api.spotify.com/v1/albums/?${queryParams}`, options)
        .then(res => res.data.albums);
      ;
    }).catch(err => {
      console.log('Error getting details of albums: ', err.message);
      console.error(err.response.status);
      console.error(err.response.data);
    });
  }
  // Window by 20, request to albums endpoint
  const albumIdSet = new Set(albumIds);
  const idWindows = window(Array.from(albumIdSet), 20);
  const promises = idWindows.map(_getDetails);

  return Promise.all(promises);

}

async function preprocessTracks(accessToken, tracks) {
  // Preprocess tracks to have our own features
  const albumIds = tracks.map(track => track.album.id);
  const albumDetails = await getDetailsOfAlbums(accessToken, albumIds);

  const albumIdToGenres = R.pipe(
    R.map(({id, genres}) => [id, genres]),
    R.fromPairs
  )(albumDetails);

  return tracks.map(track => {
    const added_at = moment(track.added_at);
    const now = moment();
    const age = moment.duration(now.diff(added_at)).asDays();

    const album = track.album;
    const year = moment(album.release_date).year();
    const artists = track.artists.map(e => e.name);

    const genres = albumIdToGenres[album.id];

    const features = {
      added_at,
      age,
      year,
      genres,
    };
    return Object.assign({}, track, { features });
  });
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
  const { result } = await _getUserTracks(accessToken, { limit });
  return { result: result.tracks };
}

async function getPopularTracks(accessToken, { limit = 50 }) {
  const { result: trackObjs } = await getAllUserTracks(accessToken);
  const popularTracks = _getPopularTracks(trackObjs, limit);
  return { result: popularTracks };
}

module.exports = {
  getAllUserTracks,
  getRecentlyAddedTracks,
  getTopTracks,
  getPopularTracks,
  TIME_RANGE_OPTS,
};
