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

function window(arr, size) {
  const windows = [];
  for (let i = 0; i < arr.length; i += size) {
    windows.push(arr.slice(i, i + size));
  }
  return windows;
}

async function getDetailsByWindow(accessToken, endpoint, ids) {
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
    return axios
      .get(`${endpoint}/?${queryParams}`, options)
      .then(res => res.data)
      .catch(err => {
        console.log('Error getting details of: ', err.message);
        console.error(err.response.status);
        console.error(err.response.data);
      });
  }
  // Window by 20 (max for Spotify API), request to endpoint
  const idSet = new Set(ids);
  const idWindows = window(Array.from(idSet), 20);
  const promises = idWindows.map(_getDetails);

  const windows = await Promise.all(promises);
  return windows.reduce((memo, item) => memo.concat(item), []);
}

async function getDetailsOfAlbums(accessToken, albumIds) {
  const windows = await getDetailsByWindow(
    accessToken,
    'https://api.spotify.com/v1/albums',
    albumIds
  );
  return R.chain(res => res.albums, windows);
}

async function getDetailsOfArtists(accessToken, artistIds) {
  const windows = await getDetailsByWindow(
    accessToken,
    'https://api.spotify.com/v1/artists',
    artistIds
  );
  return R.chain(res => res.artists, windows);
}

const RELEASE_DATE_FORMATS = {
  year: 'YYYY',
  month: 'YYYY-MM',
  day: 'YYYY-MM-DD',
};

async function preprocessTracks(accessToken, tracks) {
  // Preprocess tracks to have our own features
  const albumIds = tracks.map(track => track.album.id);
  const artistIds = R.chain(track => track.artists.map(e => e.id), tracks);
  const [artistDetails, albumDetails] = await Promise.all([
    await getDetailsOfArtists(accessToken, artistIds),
    await getDetailsOfAlbums(accessToken, albumIds),
  ]);
  console.log('Album details: ', albumDetails);
  console.log('Artist details: ', artistDetails);

  const idToGenres = R.pipe(
    R.map(({ id, genres }) => [id, genres]),
    R.fromPairs
  );
  const albumIdToGenres = idToGenres(albumDetails);
  const artistIdToGenres = idToGenres(artistDetails);

  const processedTracks = tracks.map(track => {
    const added_at = moment(track.added_at);
    const now = moment();
    const age = moment.duration(now.diff(added_at)).asDays();

    const album = track.album;
    const momentFormat = RELEASE_DATE_FORMATS[album.release_date_precision];
    const year = moment(album.release_date, momentFormat).year();

    // Maybe should split up these two and only use artist one if album is not classified
    const albumGenres = albumIdToGenres[album.id];
    const artistGenres = R.chain(
      artist => artistIdToGenres[artist.id],
      track.artists
    );

    const genres = albumGenres.concat(artistGenres);
    const features = {
      added_at,
      age,
      year,
      genres,
    };
    return Object.assign({}, track, { features });
  });
  return { result: processedTracks };
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

module.exports = {
  getPagedUserTracks,
  getAllUserTracks,
  getRecentlyAddedTracks,
  getTopTracks,
  getPopularTracks,
  preprocessTracks,
  TIME_RANGE_OPTS,
};
