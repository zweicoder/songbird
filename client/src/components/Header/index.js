import React from 'react';
import logo from './songbird-clean-logo.png';
import './index.css';
import Button from '../Button.js';
import { isAuthenticated } from '../../services/authService.js';
import { withRouter } from 'react-router-dom';

const LogoutButton = () => {
  if (!isAuthenticated()) {
    return null;
  }
  return (
    <div className="pull-right vertical-center">
      <Button className="btn action-button" href="/logout">
        Logout
      </Button>
    </div>
  );
};

const PremiumButton = ({ location }) => {
  if (!isAuthenticated() || location.pathname === '/premium') {
    return null;
  }
  return (
    <div className="pull-right vertical-center">
      <Button className="btn action-button" href="/premium">
        Premium
      </Button>
    </div>
  );
};

const Header = ({ location, history }) => {

  return (
    <header className="header">
      <div className="vertical-center pull-left logo-container" onClick={() => history.push('/')}>
        <img src={logo} className="logo pull-left" alt="logo" />
        <h2 className="title">Songbird</h2>
      </div>
      <LogoutButton />
      <PremiumButton location={location} />
    </header>
  );
};

export default withRouter(Header);
