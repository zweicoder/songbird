import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';

import Cookies from 'cookies-js';
import { COOKIE_SONGBIRD_REFRESH_TOKEN } from '../constants.js';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const token = Cookies.get(COOKIE_SONGBIRD_REFRESH_TOKEN);
  console.log('token: ', token);
  return (
    <Route
      {...rest}
      render={props =>
        token ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
