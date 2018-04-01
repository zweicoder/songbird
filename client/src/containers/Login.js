import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { Button } from 'react-bootstrap';

import { isAuthenticated } from '../services/authService.js';
import CONSTANTS from '../constants.js';
const { URL_BACKEND_LOGIN } = CONSTANTS;

class Login extends Component {
  render() {
    if (isAuthenticated()) {
      return <Redirect to={{ pathname: '/' }} />;
    }

    return (
      <div>
        <Button bsStyle="primary" bsSize="large" href={URL_BACKEND_LOGIN}>
          Login with Spotify
        </Button>
        <div>
          <a href="/?token=12345">Pretend OAuth</a>
        </div>
      </div>
    );
  }
}

export default Login;
