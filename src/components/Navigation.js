import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from 'material-ui/Toolbar';
import { cyan300 as accent } from 'material-ui/styles/colors';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import Assignment from 'material-ui/svg-icons/action/assignment';
import Settings from 'material-ui/svg-icons/action/settings';

class Navigation extends Component {
  updateGanttData(event) {
    if (event.keyCode === 13) {
      this.props.updateGanttData(event.target.value);
    }
  }
  navigateRight() {
    this.props.updateChartRange('right');
  }
  navigateLeft() {
    this.props.updateChartRange('left');
  }
  render() {
    if (this.props.userToken) {
      return (
        <div>
          <Drawer open={this.props.open}>
            <p className="drawerHeader">Stuff...</p>
            <Divider />
            <MenuItem>Test</MenuItem>
          </Drawer>
          <AppBar
            style={{background: 'rgba(0, 0, 0, 0.5)'}}
            title="Prett-ier Jira"
            onLeftIconButtonTouchTap={this.props.toggleDrawer}
            className="appBar"
          >
            <Toolbar style={{background: 'none'}}>
              <ToolbarGroup firstChild={true}>
                <FlatButton className="chevronButton" icon={<Assignment/>} secondary={true} onTouchTap={this.props.toggleStatsModal}/>
              </ToolbarGroup>
              <ToolbarGroup>
                <FlatButton className="chevronButton" icon={<Settings/>} secondary={true} onTouchTap={this.props.toggleSettingsModal}/>
              </ToolbarGroup>
              <ToolbarGroup>
                <FlatButton className="chevronButton" icon={<ChevronLeft/>} secondary={true} onTouchTap={this.navigateLeft.bind(this)}/>
                <FlatButton className="chevronButton" icon={<ChevronRight/>} secondary={true} onTouchTap={this.navigateRight.bind(this)}/>
              </ToolbarGroup>
              <ToolbarGroup style={{width: '550px'}}>
                <TextField
                  id="jqlString"
                  inputStyle={{color: 'white', textAlign: 'center'}}
                  fullWidth={true}
                  hintText="Enter JQL (ex: 'project = myProject AND status = Open')"
                  hintStyle={{color: accent}}
                  defaultValue={this.props.jqlString}
                  onKeyDown={this.updateGanttData.bind(this)}
                />
              </ToolbarGroup>
              <ToolbarGroup>
                <ToolbarSeparator />
                <FlatButton label="Logout" secondary={true} onTouchTap={this.props.logout}/>
              </ToolbarGroup>
            </Toolbar>
          </AppBar>
        </div>
      )
    }
    return null;
  }
}

export default Navigation;
