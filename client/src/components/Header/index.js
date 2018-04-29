import React from 'react';
import logo from './songbird-clean-logo.png';
import './index.css';
import Button from '../Button.js';
import { isAuthenticated } from '../../services/authService.js';

const LogoutButton = () => {
  return (
    <div className="pull-right vertical-center">
      <Button className="btn action-button" href="/logout">
        Logout
      </Button>
    </div>
  );
};
const Header = () => {
  return (
    <header className="header">
      <div className="vertical-center pull-left">
        <img src={logo} className="logo pull-left" alt="logo" />
        <h2 className="title">Songbird</h2>
      </div>
      {isAuthenticated() && <LogoutButton />}
    </header>
  );
};

export default Header;
