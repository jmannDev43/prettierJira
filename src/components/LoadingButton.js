import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

export default ({ isLoading, text, loadingText, disabled = false, ...props }) => (
  <RaisedButton
    className="loginButton"
    buttonStyle={{ height: '50px', lineHeight: '50px' }}
    disabled={ disabled || isLoading }  {...props}
    label={ isLoading ? loadingText : text }
    icon={ isLoading ? <FontIcon className="fa fa-refresh fa-spin" /> : null }
  >
  </RaisedButton>
);