import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { COOKIE_SONGBIRD_REFRESH_TOKEN } from '../constants.js';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const token = window.localStorage.getItem(COOKIE_SONGBIRD_REFRESH_TOKEN);
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
