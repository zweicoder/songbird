const axios = require('axios');
const qs = require('query-string');
const { getBasicAuthHeader } = require('./oauthUtils.js');

const SPOTIFY_ENDPOINT_REFRESH_TOKEN = 'https://accounts.spotify.com/api/token';

async function refreshAccessToken(refreshToken) {
  try {
    const opts = {
      headers: getBasicAuthHeader(),
    };
    const queryParams = qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    const res = await axios.post(
      SPOTIFY_ENDPOINT_REFRESH_TOKEN,
      queryParams,
      opts
    );
    return { err: null, result: res.data.access_token };
  } catch (err) {
    console.error(err);
    console.error(`Failed to refresh access token: ${err.response.statusText}`);
    return { err };
  }
}


module.exports = {
  refreshAccessToken
};
