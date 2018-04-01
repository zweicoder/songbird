import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { getToken } from '../services/authService.js';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const token = getToken();
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
