const parsed = require('dotenv').config();
const axios = require('axios');
const qs = require('query-string');
const {
  getAllUserTracks,
  getRecentlyAddedTracks,
  getPopularTracks,
} = require('./trackService.js');
const { refreshAccessToken } = require('./oauth2Service.js');

async function main() {
  const userId = 'heinekenchong';
  const refreshToken =
    'AQDae5GRoMQ3W9OHQPCpv7z5Bkm9n2a5FP7tm_xeV8zARr91_ajX-oBhZX_FjzVrQ4wE61nZzWluGD35pn9VKdn6t7otrE7WMpeb_O8-gJrv1CdtYHyFixfCuVvIxi-s8Y0';

  const refreshResponse = await refreshAccessToken(refreshToken);
  if (refreshResponse.err) {
    return;
  }

  const accessToken = refreshResponse.result;
  const tracks = await getAllUserTracks(accessToken);
  console.log('Popular tracks:');
  console.log(getPopularTracks(tracks, 25));
  console.log('Recent tracks');
  console.log(getRecentlyAddedTracks(tracks, 25));
}

main();
