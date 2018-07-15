// Authentication stored in localStorage
import {
  KEY_SONGBIRD_REFRESH_TOKEN,
  KEY_SONGBIRD_ACCESS_TOKEN,
  URL_BACKEND_BASE,
} from '../constants.js';
import axios from 'axios';
import qs from 'query-string';

export function logout() {
  window.localStorage.removeItem(KEY_SONGBIRD_ACCESS_TOKEN);
  window.localStorage.removeItem(KEY_SONGBIRD_REFRESH_TOKEN);
}
export function login({ accessToken, refreshToken }) {
  if (!accessToken || !refreshToken) {
    return null;
  }
  window.localStorage.setItem(KEY_SONGBIRD_ACCESS_TOKEN, accessToken);
  window.localStorage.setItem(KEY_SONGBIRD_REFRESH_TOKEN, refreshToken);
  return true;
}
export function getRefreshToken() {
  return window.localStorage.getItem(KEY_SONGBIRD_REFRESH_TOKEN);
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  const queryParams = qs.stringify({
    refreshToken,
  });
  try {
    const res = await axios.get(`${URL_BACKEND_BASE}/access-token?${queryParams}`);
    const { result: accessToken } = res.data;
    window.localStorage.setItem(KEY_SONGBIRD_ACCESS_TOKEN, accessToken);
    return accessToken;
  }catch(err) {
    console.error('Unable to refresh access token!');
    throw err;
  }
}

export function getTokens() {
  return {
    accessToken: window.localStorage.getItem(KEY_SONGBIRD_ACCESS_TOKEN),
    refreshToken: window.localStorage.getItem(KEY_SONGBIRD_REFRESH_TOKEN),
  };
}

export function isAuthenticated() {
  return !!getRefreshToken();
}
