const {OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET} = require('../constants.js');

function getOAuthHeader(accessToken) {
  if (!accessToken) {
    throw new Error('No access token given!');
  }
  return { Authorization: 'Bearer ' + accessToken };
}

function getBasicAuthHeader() {
  const authorizationHeader = new Buffer(
    OAUTH_CLIENT_ID + ':' + OAUTH_CLIENT_SECRET
  ).toString('base64');
  return { Authorization: `Basic ${authorizationHeader}` };
}

module.exports = {
  getOAuthHeader,
  getBasicAuthHeader,
};
