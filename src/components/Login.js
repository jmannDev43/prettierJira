import React, {Component} from 'react';
import rp from 'request-promise-native';
import { Card, CardText, CardTitle, CardActions } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import LoadingButton from './LoadingButton';
import { withRouter } from 'react-router-dom';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      domainError: '',
      usernameError: '',
      passwordError: '',
      isLoading: false,
    }
  }
  componentWillMount() {
    if (this.props.logout) {
      this.props.logout();
    }
  }
  login() {
    this.setState({ isLoading: true });
    const domain = document.getElementById('domain').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (domain && username && password) {
      rp(`http://localhost:9000/api/login/${encodeURIComponent(domain)}/${username}/${password}`).then(res => {
        const parsed = JSON.parse(res);
        if (parsed.session.value) {
          const userToken = btoa(`${username}:${password}`);
          this.props.updateUserToken(domain, userToken);
          this.props.history.push('/board');
        } else {
          const errorMessage = 'Incorrect credentials provided';
          this.setState({
            domainError: errorMessage,
            usernameError: errorMessage,
            passwordError: errorMessage,
            isLoading: false,
          });
        }
      }).catch(err => {
        console.log('err', err);
      });
    } else {
      this.setState({
        isLoading: false,
        domainError: !domain ? 'Domain is required to login' : '',
        usernameError: !username ? 'Username is required to login' : '',
        passwordError: !password ? 'Password is required to login' : ''
      });
    }
  }
  render() {
    return (
      <div className="row loginForm">
        <div className="col col-sm-4 col-sm-offset-4">
          <Card>
            <CardTitle id="loginTitle" title="Login"/>
            <CardText>
              <TextField id="domain" errorText={this.state.domainError} hintText="(myDomain.com)" floatingLabelText="Domain" floatingLabelFixed={true} fullWidth={true}/>
              <br />
              <TextField id="username" errorText={this.state.usernameError} floatingLabelText="Username" floatingLabelFixed={true} fullWidth={true}/>
              <br />
              <TextField id="password" type="password" errorText={this.state.passwordError} floatingLabelText="Password" floatingLabelFixed={true} fullWidth={true}/>
            </CardText>
            <CardActions>
              <br />
              <LoadingButton
                text="Login"
                loadingText="Logging in..."
                isLoading={this.state.isLoading}
                primary={true}
                fullWidth={true}
                onTouchTap={this.login.bind(this)}
              />
            </CardActions>
          </Card>
        </div>
      </div>
    )
  }
}

export default withRouter(Login);
