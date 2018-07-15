const axios = require('axios');
const qs = require('query-string');

const URL_SPOTIFY_REFRESH_TOKEN = 'https://accounts.spotify.com/api/token';

// Used by both server & client to generate header required for oauth authorization via accessToken
function getOAuthHeader(accessToken) {
  if (!accessToken || !(typeof accessToken === 'string')) {
    throw new Error(`Bad accessToken given: ${accessToken}`);
  }
  return { Authorization: 'Bearer ' + accessToken };
}

function getBasicAuthHeader(clientId, clientSecret) {
  const authorizationHeader = new Buffer(
    clientId + ':' + clientSecret
  ).toString('base64');
  return { Authorization: `Basic ${authorizationHeader}` };
}

// Used mainly by server to request for oauth tokens
const OAuthClient = (clientId, clientSecret) => {
  if (!clientId || !clientSecret) {
    throw new Error('clientId & clientSecret is required!');
  }

  async function refreshAccessToken(refreshToken) {
    try {
      const opts = {
        headers: getBasicAuthHeader(clientId, clientSecret),
      };
      const queryParams = qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      const res = await axios.post(
        URL_SPOTIFY_REFRESH_TOKEN,
        queryParams,
        opts
      );
      return { result: res.data.access_token };
    } catch (err) {
      console.error(
        `Failed to refresh access token: ${err.response.statusText}`
      );
      console.error(err.response.data);
      throw err;
    }
  }
  async function exchangeAuthorizationCode(code, redirectUri) {
    const opts = {
      headers: getBasicAuthHeader(clientId, clientSecret),
    };
    const formData = {
      code,
      redirect_uri: redirectUri,
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
      // console.error(err.config);
      console.error(err.response.status);
      console.error(err.response.data);
      throw err;
    }
  }
  return {
    refreshAccessToken,
    exchangeAuthorizationCode,
  };
};

module.exports = {
  OAuthClient,
  getOAuthHeader,
};
