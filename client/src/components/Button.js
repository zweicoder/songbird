import { withRouter } from 'react-router-dom';
import React from 'react';

// Ignore staticContext so React won't complain
const Button = withRouter(
  ({ history, href, external, children, staticContext: _, ...restProps }) => {
    function onClick() {
      if (external) {
        window.location = href;
      } else {
        history.push(href);
      }
    }
    return (
      <button type="button" {...restProps} onClick={onClick}>
        {children}
      </button>
    );
  }
);

export default Button;
