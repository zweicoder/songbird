import React from 'react';
import logo from './songbird-clean-logo.png'
import './index.css';
import Button from '../Button.js'

const Header = () => {
  return (
    <header className="header">
      <div className="vertical-center pull-left">
        <img src={logo} className="logo pull-left" alt="logo"/>
        <h2 className="title">Songbird</h2>
      </div>
      <div className="pull-right vertical-center">
        <Button class="btn action-button" href="/logout">Logout</Button>
      </div>
    </header>
  );
};

export default Header;
