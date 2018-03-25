import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Cookies from 'cookies-js';
import {
  COOKIE_SONGBIRD_REFRESH_TOKEN,
  COOKIE_SONGBIRD_ACCESS_TOKEN,
} from '../constants.js';

class Logout extends Component {
  componentDidMount() {
    Cookies.expire(COOKIE_SONGBIRD_ACCESS_TOKEN);
    Cookies.expire(COOKIE_SONGBIRD_REFRESH_TOKEN);
  }
  render() {
    return <Redirect to={{ pathname: '/login' }} />;
  }
}

export default Logout;
