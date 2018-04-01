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
  render() {
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
