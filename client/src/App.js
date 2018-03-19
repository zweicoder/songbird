import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  Switch,
} from 'react-router-dom';
import qs from 'query-string';
import Cookies from 'cookies-js';

import PrivateRoute from './components/PrivateRoute.js';
import Home from './containers/Home.js';
import Login from './containers/Login.js';

import logo from './logo.svg';
import './App.css';
import { COOKIE_SONGBIRD_REFRESH_TOKEN } from './constants.js';

class App extends Component {
  /**
     1. Check OAUTH token (just give refresh token now)
     2. If token present, user is logged in, get name and say hi
     3. Button to generate playlist / preview songs??
     4. Button to save playlist
     5. Button to subscribe??
  */
  render() {
    const { token } = qs.parse(window.location.search);
    if (token) {
      console.log('Got token: ', token);
      // Redirect to exact path "/" if response from oauth. TODO check token valid?
      Cookies.set(COOKIE_SONGBIRD_REFRESH_TOKEN, token, { expires: Infinity });
    }
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to Songbird</h1>
          </header>
          <Switch>
            <Route path="/login" component={Login} />
            <PrivateRoute path="/" component={Home} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
