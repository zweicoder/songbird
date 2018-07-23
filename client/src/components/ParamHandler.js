import { login } from '../services/authService.js';
import qs from 'querystring';
import React from 'react';
import { Redirect } from 'react-router';

const ParamHandler = () => {
  if (window.location.search.length === 0) {
    return null;
  }
  const { accessToken, refreshToken, error } = qs.parse(window.location.search.substr(1));
  if (error) {
    console.error(error);
    return null;
  }
  const loggedIn = login({ accessToken, refreshToken });
  if (loggedIn) {
    console.log('Successfully logged in ');
    return <Redirect to={{ pathname: '/' }} />;
  }

  return null;
};

export default ParamHandler;
