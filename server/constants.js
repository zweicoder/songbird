require('dotenv').config();

module.exports = {
  OAUTH_REDIRECT_URI: process.env.OAUTH_REDIRECT_URI || 'http://localhost:8888/callback',
  OAUTH_SCOPES:
    'user-read-private user-read-email playlist-read-private user-library-read playlist-modify-public playlist-modify-private user-top-read',
  OAUTH_CLIENT_ID: process.env.CLIENT_ID,
  OAUTH_CLIENT_SECRET: process.env.CLIENT_SECRET,

  URL_FRONTEND: process.env.URL_FRONTEND || 'http://localhost:3000/songbird',
  URL_SPOTIFY_REFRESH_TOKEN: 'https://accounts.spotify.com/api/token',
  URL_SPOTIFY_CURRENT_USER: 'https://api.spotify.com/v1/me',
  URL_SPOTIFY_AUTHORIZATION_CODE: 'https://accounts.spotify.com/authorize',

  KEY_OAUTH2_STATE: 'spotify_auth_state',

  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || 'postgres://postgres:postgres@localhost/songbird'
};
