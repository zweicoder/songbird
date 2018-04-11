const R = require('ramda');
require('dotenv').config();

const PLAYLIST_TYPE_DB_MAP = {
  PLAYLIST_TYPE_TOP_SHORT_TERM: 0,
  PLAYLIST_TYPE_TOP_MID_TERM: 1,
  PLAYLIST_TYPE_TOP_LONG_TERM: 2,
  PLAYLIST_TYPE_POPULAR: 3,
  PLAYLIST_TYPE_RECENT: 4,
};

const PLAYLIST_TYPE_DB_REVERSE_MAP = R.invertObj(PLAYLIST_TYPE_DB_MAP);

module.exports = {
  OAUTH_REDIRECT_URI: 'http://localhost:8888/callback',
  OAUTH_SCOPES:
    'user-read-private user-read-email playlist-read-private user-library-read playlist-modify-public playlist-modify-private user-top-read',
  OAUTH_CLIENT_ID: process.env.CLIENT_ID,
  OAUTH_CLIENT_SECRET: process.env.CLIENT_SECRET,

  URL_FRONTEND: 'http://localhost:3000',
  URL_SPOTIFY_REFRESH_TOKEN: 'https://accounts.spotify.com/api/token',
  URL_SPOTIFY_CURRENT_USER: 'https://api.spotify.com/v1/me',
  URL_SPOTIFY_AUTHORIZATION_CODE: 'https://accounts.spotify.com/authorize',

  KEY_OAUTH2_STATE: 'spotify_auth_state',

  PLAYLIST_TYPE_DB_MAP,
  PLAYLIST_TYPE_DB_REVERSE_MAP,
};
