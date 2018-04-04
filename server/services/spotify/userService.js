const axios = require('axios');

const { getOAuthHeader } = require('../../lib/oauthUtils.js');
const { URL_SPOTIFY_CURRENT_USER } = require('../../constants.js');

async function getUserProfile(accessToken) {
  const opts = {
    headers: getOAuthHeader(accessToken),
  };
  try {
    const resp = await axios.get(URL_SPOTIFY_CURRENT_USER, opts);
    return { result: resp.data };
  } catch (err) {
    console.error('Error trying to get user profile');
    console.error(err.config);
    console.error(err.response.status);
    console.error(err.response.data);
    return { err };
  }
}

module.exports = {
  getUserProfile,
};
