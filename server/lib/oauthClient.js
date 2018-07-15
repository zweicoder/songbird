const {OAuthClient} = require('spotify-service/oauth2Service');
const {OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET} = require('../constants.js');
const client = OAuthClient(OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET);
module.exports = client;
