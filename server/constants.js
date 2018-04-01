require('dotenv').config();
module.exports = {
  OAUTH_REDIRECT_URI: 'http://localhost:8888/callback',
  OAUTH_SCOPES:
    'user-read-private user-read-email playlist-read-private user-library-read playlist-modify-public playlist-modify-private user-top-read',

  URL_FRONTEND: 'http://localhost:3000',
  URL_SPOTIFY_REFRESH_TOKEN: 'https://accounts.spotify.com/api/token',
  URL_SPOTIFY_CURRENT_USER: 'https://api.spotify.com/v1/me',
  URL_SPOTIFY_AUTHORIZATION_CODE: 'https://accounts.spotify.com/authorize',

  COOKIE_STATE_KEY: 'spotify_auth_state',
  OAUTH_CLIENT_ID: process.env.CLIENT_ID,
  OAUTH_CLIENT_SECRET: process.env.CLIENT_SECRET,
};
