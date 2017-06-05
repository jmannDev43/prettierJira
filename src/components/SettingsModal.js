import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

class SettingsModal extends Component {
  handleClose = () => {
    this.props.toggleModal();
  };
  handleSubmit = () => {
    this.props.toggleModal();
  };

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose.bind(this)}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleSubmit.bind(this)}
      />,
    ];

    return (
      <div>
        <Dialog
          title="Settings"
          actions={actions}
          modal={false}
          open={this.props.open}
          onRequestClose={this.handleClose.bind(this)}
          autoScrollBodyContent={true}
        >

        </Dialog>
      </div>
    );
  }
}

export default SettingsModal;
