import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute.js';
import ParamHandler from './components/ParamHandler.js';
import Home from './containers/Home/';
import Login from './containers/Login/';
import Logout from './containers/Logout.js';
import Header from './components/Header';
import Footer from './components/Footer';
import Premium from './containers/Premium';

import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Header />
          <div className="container">
            <Route path="/" component={ParamHandler} />
            <Switch>
              <Route path="/logout" component={Logout} />
              <Route path="/login" component={Login} />
              <PrivateRoute path="/premium" component={Premium}/>
              <PrivateRoute path="/" component={Home} />
            </Switch>
          </div>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
