import React from 'react';
import logo from './logo.svg'
import './index.css';

const Header = () => {
  return (
    <header className="header">
      <div className="vertical-center pull-left">
        <img src={logo} className="logo pull-left" alt="logo"/>
        <h2 className="title">Songbird</h2>
      </div>
      <div className="pull-right vertical-center">
        <h4>Logout</h4>
      </div>
    </header>
  );
};

export default Header;
