import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import qs from 'query-string';

import PrivateRoute from './components/PrivateRoute.js';
import Home from './containers/Home.js';
import Login from './containers/Login.js';
import Logout from './containers/Logout.js';

import logo from './logo.svg';
import './App.css';
import {
  COOKIE_SONGBIRD_REFRESH_TOKEN,
  COOKIE_SONGBIRD_ACCESS_TOKEN,
} from './constants.js';

class App extends Component {
  /**
     1. Check OAUTH token (just give refresh token now)
     2. If token present, user is logged in, get name and say hi
     3. Button to generate playlist / preview songs??
     4. Button to save playlist
     5. Button to subscribe??
  */
  componentWillMount() {
    console.log(qs.parse(window.location.search));
  }
  render() {
    const { accessToken, refreshToken } = qs.parse(window.location.search);
    if (refreshToken) {
      console.log('Successfully logged in ');
      window.localStorage.setItem(COOKIE_SONGBIRD_ACCESS_TOKEN, accessToken);
      window.localStorage.setItem(COOKIE_SONGBIRD_REFRESH_TOKEN, refreshToken);
    }
    // TODO render errors?
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to Songbird</h1>
          </header>
          <div className="container">
            <Switch>
              <Route path="/logout" component={Logout} />
              <Route path="/login" component={Login} />
              <PrivateRoute path="/" component={Home} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
