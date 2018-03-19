import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

const URL_SERVER_LOGIN =
  process.env.NODE_ENV === 'production'
    ? 'TODO'
    : 'http://localhost:8888/login';

class Login extends Component {
  render() {
    return (
      <div>
        <Button bsStyle="primary" bsSize="large" href={URL_SERVER_LOGIN}>
          Login with Spotify
        </Button>
        <div>
        <a href="/?token=12345">Pretend OAuth</a>
        </div>
      </div>
    );
  }
}

export default Login
