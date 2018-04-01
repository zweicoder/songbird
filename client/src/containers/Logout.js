import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {logout} from '../services/authService.js';

class Logout extends Component {
  componentDidMount() {
    logout();
  }
  render() {
    return <Redirect to={{ pathname: '/login' }} />;
  }
}

export default Logout;
