import React from 'react';
import { Route } from 'react-router-dom';

export default ({ component: Comp, props: childProps, ...rest }) => (
  <Route {...rest} render={ props => <Comp {...props} {...childProps} /> } />
);
