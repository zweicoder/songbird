const URL_BACKEND_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://songbird.zwei.codes'
    : 'http://localhost:8888';

const constants = {
  URL_BACKEND_BASE,
  URL_BACKEND_LOGIN: `${URL_BACKEND_BASE}/login`,
  URL_BACKEND_PLAYLIST: `${URL_BACKEND_BASE}/playlist`,
  URL_BACKEND_PLAYLIST_SUBSCRIBE: `${URL_BACKEND_BASE}/playlist/subscribe`,
  KEY_SONGBIRD_REFRESH_TOKEN: 'KEY_SONGBIRD_REFRESH_TOKEN',
  KEY_SONGBIRD_ACCESS_TOKEN: 'KEY_SONGBIRD_ACCESS_TOKEN',
};

module.exports = constants;
