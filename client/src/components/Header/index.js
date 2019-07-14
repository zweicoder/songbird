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

const DonateButton = () => {
  return (
    <div className="pull-right vertical-center">
      <form
        action="https://www.paypal.com/cgi-bin/webscr"
        method="post"
        target="_top"
      >
        <input type="hidden" name="cmd" value="_s-xclick" />
        <input type="hidden" name="hosted_button_id" value="8YDJC378TR7HL" />
        <input
          type="image"
          src="https://www.paypalobjects.com/en_GB/i/btn/btn_donate_LG.gif"
          border="0"
          name="submit"
          alt="PayPal – The safer, easier way to pay online!"
        />
        <img
          alt=""
          border="0"
          src="https://www.paypalobjects.com/en_GB/i/scr/pixel.gif"
          width="1"
          height="1"
        />
      </form>
    </div>
  );
};

const Header = ({ location, history }) => {
  return (
    <header className="header">
      <div
        className="vertical-center pull-left logo-container"
        onClick={() => history.push('/')}
      >
        <img src={logo} className="logo pull-left" alt="logo" />
        <h2 className="title">Songbird</h2>
      </div>
      <LogoutButton />
    </header>
  );
};

export default withRouter(Header);
