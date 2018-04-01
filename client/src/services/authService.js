// Authentication stored in localStorage
import {
  KEY_SONGBIRD_REFRESH_TOKEN,
  KEY_SONGBIRD_ACCESS_TOKEN,
} from '../constants.js';

export function logout() {
  window.localStorage.removeItem(KEY_SONGBIRD_ACCESS_TOKEN);
  window.localStorage.removeItem(KEY_SONGBIRD_REFRESH_TOKEN);
}
export function login({accessToken, refreshToken}){
  if (!accessToken || !refreshToken) {
    return null;
  }
  window.localStorage.setItem(KEY_SONGBIRD_ACCESS_TOKEN, accessToken);
  window.localStorage.setItem(KEY_SONGBIRD_REFRESH_TOKEN, refreshToken);
  return true;
}
export function getToken() {
  return window.localStorage.getItem(KEY_SONGBIRD_REFRESH_TOKEN);
}

export function getTokens() {
  return {
    accessToken: window.localStorage.getItem(KEY_SONGBIRD_ACCESS_TOKEN),
    refreshToken: window.localStorage.getItem(KEY_SONGBIRD_REFRESH_TOKEN),
  };
}

export function isAuthenticated() {
  return !!getToken();
}
