const { OAuthClient } = require('spotify-service/oauth2Service');
const {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI,
} = require('../constants.js');

const client = OAuthClient({
  clientId: OAUTH_CLIENT_ID,
  clientSecret: OAUTH_CLIENT_SECRET,
  redirectUri: OAUTH_REDIRECT_URI,
});
module.exports = client;
