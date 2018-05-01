import React, { Component } from 'react';
import { Redirect } from 'react-router';

import Button from '../../components/Button.js'
import { isAuthenticated } from '../../services/authService.js';
import CONSTANTS from '../../constants.js';
import './index.css';
const { URL_BACKEND_LOGIN } = CONSTANTS;


class Login extends Component {
  render() {
    if (isAuthenticated()) {
      return <Redirect to={{ pathname: '/' }} />;
    }

    return (
      <div className="login">
        <h1>Smarter Playlists for Spotify</h1>
        <ul>
          <li>Analyzes your own favorite song collection</li>
          <li>Playlists for recently added tracks, top tracks, and more</li>
          <li>Playlist updates itself daily</li>
        </ul>
        <Button className="btn-landing" href={URL_BACKEND_LOGIN} external>
          <i className="fab fa-spotify fa-lg icon" />
          <span>Login with Spotify</span>
        </Button>
      </div>
    );
  }
}

export default Login;
