// Authentication stored in localStorage
import {
  COOKIE_SONGBIRD_REFRESH_TOKEN,
  COOKIE_SONGBIRD_ACCESS_TOKEN,
} from '../constants.global.js';

export function logout() {
  window.localStorage.removeItem(COOKIE_SONGBIRD_ACCESS_TOKEN);
  window.localStorage.removeItem(COOKIE_SONGBIRD_REFRESH_TOKEN);
}
export function login({accessToken, refreshToken}){
  if (!accessToken || !refreshToken) {
    return null;
  }
  window.localStorage.setItem(COOKIE_SONGBIRD_ACCESS_TOKEN, accessToken);
  window.localStorage.setItem(COOKIE_SONGBIRD_REFRESH_TOKEN, refreshToken);
  return true;
}
export function getToken() {
  return window.localStorage.getItem(COOKIE_SONGBIRD_REFRESH_TOKEN);
}

export function getTokens() {
  return {
    accessToken: window.localStorage.getItem(COOKIE_SONGBIRD_ACCESS_TOKEN),
    refreshToken: window.localStorage.getItem(COOKIE_SONGBIRD_REFRESH_TOKEN),
  };
}

export function isAuthenticated() {
  return !!getToken();
}
