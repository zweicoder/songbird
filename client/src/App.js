import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute.js';
import ParamHandler from './components/ParamHandler.js';
import Home from './containers/Home.js';
import Login from './containers/Login.js';
import Logout from './containers/Logout.js';

import logo from './logo.svg';
import './App.css';

class App extends Component {
  /**
     1. Check OAUTH token (just give refresh token now)
     2. If token present, user is logged in, get name and say hi
     3. Button to generate playlist / preview songs??
     4. Button to save playlist
     5. Button to subscribe??
  */
  render() {
    // TODO render errors?
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <a href="/logout"><img src={logo} className="App-logo" alt="logo" /> </a>
            <h1 className="App-title">Welcome to Songbird</h1>
          </header>
          <div className="container">
            <Route path="/" component={ParamHandler} />
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
