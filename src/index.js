import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import './styles/index.css';
import './styles/bootstrap.min.css';
import App from "./App";

injectTapEventPlugin();

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
);