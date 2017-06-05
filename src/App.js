import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { cyan300 as accent, cyanA700 as primary, black } from 'material-ui/styles/colors';
import { withRouter } from 'react-router-dom';
import rp from 'request-promise-native';
import utils from './utils';
import Navigation from './components/Navigation';
import StatsModal from './components/StatsModal';
import SettingsModal from './components/SettingsModal';

import Routes from './Routes';

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto Slab, sans-serif',
  palette: {
    textColor: black,
    primary1Color: primary,
    accent1Color: accent,
    borderColor: accent,
    shadowColor: primary,
  },
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      jqlString: '',
      domain: null,
      userToken: null,
      ganttData: {
        chartMinMax: {
          min: null,
          max: null,
        },
        seriesData: [],
        statusList: [],
        aggregatesByAssignee: {},
      },
      chartMin: 19,
      chartMax: 14,
      statsModalOpen: false,
      settingsModalOpen: false,
    };
  }
  updateUserToken = (domain, userToken) => {
    this.setState({ domain, userToken });
    if (userToken) {
      this.updateGanttData(this.state.jqlString);
    }
  }

  handleLogout = (event) => {
    this.updateUserToken(null);
    this.props.history.push('/login');
  }
  toggleSettingsModal() {
    this.setState({ settingsModalOpen: !this.state.settingsModalOpen });
  }
  toggleStatsModal() {
    this.setState({ statsModalOpen: !this.state.statsModalOpen });
  }
  toggleDrawer() {
    const open = !this.state.open;
    this.setState({ open });
  }
  closeDrawerIfOpen() {
    if (this.state.open) {
      this.setState({ open: false });
    }
  }
  updateGanttData = (jqlString) => {
    if (this.state.userToken) {
      this.setState({
        ganttData: {
          seriesData: null,
          statusList: [],
          aggregatesByAssignee: {}
        }
      });
      const domain = encodeURIComponent(this.state.domain);
      if (jqlString) {
        rp(`http://localhost:9000/api/${domain}/${this.state.userToken}/${encodeURIComponent(jqlString)}`).then(res => {
          const results = JSON.parse(res);
          const ganttData = utils.getChartData(results);
          this.setState({ ganttData, jqlString });
          return ganttData;
        }).catch(err => {
          console.log('err', err);
        });
      } else {
        this.setState({ jqlString });
      }
    }
  }
  updateChartRange = (direction) => {
    let chartMin = this.state.chartMin;
    let chartMax = this.state.chartMax;
    if (direction === 'right') {
      chartMin -= 7;
      chartMax += 7;
    } else {
      chartMin += 7;
      chartMax -= 7;
    }
    this.setState({ chartMin, chartMax })
  }
  render() {
    const childProps = {
      userToken: this.state.userToken,
      jqlString: this.state.jqlString,
      updateUserToken: this.updateUserToken.bind(this),
      ganttData: this.state.ganttData,
      chartMin: this.state.chartMin,
      chartMax: this.state.chartMax,
    }
    return childProps.updateUserToken && (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          { this.state.userToken ?
            <Navigation
              toggleDrawer={this.toggleDrawer.bind(this)}
              updateGanttData={this.updateGanttData.bind(this)}
              jqlString={this.state.jqlString}
              open={this.state.open}
              userToken={this.state.userToken}
              logout={this.handleLogout.bind(this)}
              updateChartRange={this.updateChartRange.bind(this)}
              toggleStatsModal={this.toggleStatsModal.bind(this)}
              toggleSettingsModal={this.toggleSettingsModal.bind(this)}
            /> : null
          }
          <div className="container-full" onClick={this.closeDrawerIfOpen.bind(this)}>
            <Routes childProps={childProps} />
            <SettingsModal
              open={this.state.settingsModalOpen}
              toggleModal={this.toggleSettingsModal.bind(this)}
            />
            <StatsModal
              open={this.state.statsModalOpen}
              toggleModal={this.toggleStatsModal.bind(this)}
              data={this.state.ganttData.aggregatesByAssignee}
              statusList={this.state.ganttData.statusList}
            />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withRouter(App);
