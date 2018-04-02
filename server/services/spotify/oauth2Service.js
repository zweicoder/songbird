const axios = require('axios');
const qs = require('query-string');

const { getBasicAuthHeader } = require('../../lib/oauthUtils.js');
const {
  URL_FRONTEND,
  URL_SPOTIFY_REFRESH_TOKEN,
  OAUTH_REDIRECT_URI,
} = require('../../constants.js');

async function refreshAccessToken(refreshToken) {
  try {
    const opts = {
      headers: getBasicAuthHeader(),
    };
    const queryParams = qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    const res = await axios.post(URL_SPOTIFY_REFRESH_TOKEN, queryParams, opts);
    return { err: null, result: res.data.access_token };
  } catch (err) {
    console.error(err);
    console.error(`Failed to refresh access token: ${err.response.statusText}`);
    throw err;
  }
}
async function exchangeAuthorizationCode(code) {
  const opts = {
    headers: getBasicAuthHeader(),
  };
  const formData = {
    code,
    redirect_uri: OAUTH_REDIRECT_URI,
    grant_type: 'authorization_code',
  };

  try {
    const resp = await axios.post(
      URL_SPOTIFY_REFRESH_TOKEN,
      qs.stringify(formData),
      opts
    );
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
    } = resp.data;
    return { result: { accessToken, refreshToken } };
  } catch (err) {
    console.error('Failed to authenticate with given authorization code');
    console.error(err.config);
    console.error(err.response.status);
    console.error(err.response.data);
    throw err;
  }
}

module.exports = {
  refreshAccessToken,
  exchangeAuthorizationCode,
};
