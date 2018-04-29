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
import Home from './containers/Home/';
import Login from './containers/Login/';
import Logout from './containers/Logout.js';
import Header from './components/Header';

import './App.css';

class App extends Component {
  render() {
    return (
      <Router basename="/songbird">
        <div className="App">
          <Header/>
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
