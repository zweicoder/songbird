const axios = require('axios');

const { getOAuthHeader } = require('../oauth2Service');

const URL_SPOTIFY_CURRENT_USER = 'https://api.spotify.com/v1/me';

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
