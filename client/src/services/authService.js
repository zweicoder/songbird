// Authentication stored in localStorage
import {
  KEY_SONGBIRD_REFRESH_TOKEN,
  KEY_SONGBIRD_ACCESS_TOKEN,
  URL_BACKEND_BASE,
} from '../constants.js';
import axios from 'axios';
import qs from 'query-string';

const KEY_SONGBIRD_TOKEN_VALID_TO = 'KEY_SONGBIRD_TOKEN_VALID_TO';

export function logout() {
  window.localStorage.removeItem(KEY_SONGBIRD_ACCESS_TOKEN);
  window.localStorage.removeItem(KEY_SONGBIRD_REFRESH_TOKEN);
}
export function login({ accessToken, refreshToken }) {
  if (!accessToken || !refreshToken) {
    console.warn(
      `Got bad token while logging in. Access Token: ${accessToken}. Refresh Token: ${refreshToken}`
    );
    return null;
  }
  // Spotify access tokens seem to expire after 1 hour, so we invalidate just a little bit earlier
  // btw we fully depend on this time to decide if we should refresh, hoping that our user doesn't do anything weird
  const validTo = new Date().getTime() + 55 * 60 * 1000;
  window.localStorage.setItem(KEY_SONGBIRD_ACCESS_TOKEN, accessToken);
  window.localStorage.setItem(KEY_SONGBIRD_TOKEN_VALID_TO, validTo);
  window.localStorage.setItem(KEY_SONGBIRD_REFRESH_TOKEN, refreshToken);
  return true;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  const queryParams = qs.stringify({
    refreshToken,
  });
  try {
    const res = await axios.get(
      `${URL_BACKEND_BASE}/access-token?${queryParams}`
    );
    const { result: accessToken } = res.data;
    window.localStorage.setItem(KEY_SONGBIRD_ACCESS_TOKEN, accessToken);
    console.log('Successfully refreshed token!');
    return { result: accessToken };
  } catch (err) {
    console.error('Unable to refresh access token!');
    throw err;
  }
}

export function getRefreshToken() {
  return window.localStorage.getItem(KEY_SONGBIRD_REFRESH_TOKEN);
}

// Returns access token, refreshing as needed. Only checks the time in local storage to determine if
// token has expired, hence has a slight chance where this fails.
export async function getAccessToken() {
  const validTo = window.localStorage.getItem(KEY_SONGBIRD_TOKEN_VALID_TO);
  const accessToken = window.localStorage.getItem(KEY_SONGBIRD_ACCESS_TOKEN);
  if (!accessToken) {
    return await refreshAccessToken();
  }
  if (accessToken && validTo <= new Date().getTime()) {
    console.log('Access token expired, refreshing...');
    return await refreshAccessToken();
  }
  return { result: accessToken };
}

export function isAuthenticated() {
  return !!getRefreshToken();
}
