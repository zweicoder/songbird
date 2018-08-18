const axios = require('axios');
const qs = require('query-string');
const R = require('ramda');
const moment = require('moment');

const { getOAuthHeader } = require('../oauth2Service');

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
  // console.log('Album details: ', albumDetails);
  // console.log('Artist details: ', artistDetails);

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

module.exports = {
  preprocessTracks,
};
