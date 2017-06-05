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
import { cyan300 as accent, cyanA700 as primary, white } from 'material-ui/styles/colors';

class StatsModal extends Component {
  handleClose = () => {
    this.props.toggleModal();
  };
  handleSubmit = () => {
    this.props.toggleModal();
  };

  render() {
    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onTouchTap={this.handleClose.bind(this)}
      />,
    ];

    const columnHeaders = ['Assignee', ...this.props.statusList];
    const assignees = Object.keys(this.props.data);
    return (
      <div>
        <Dialog
          title="Issues by Assignee"
          actions={actions}
          modal={false}
          open={this.props.open}
          onRequestClose={this.handleClose.bind(this)}
          autoScrollBodyContent={true}
          contentStyle={{width: '100%', maxWidth: 'none'}}
        >
          <Table
            height="400px"
            fixedHeader={true}
          >
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}
              enableSelectAll={false}
            >
              <TableRow>
                {columnHeaders.map(columnName => {
                  return <TableHeaderColumn key={columnName}>{columnName}</TableHeaderColumn>
                })}
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {assignees.map(assignee => {
                return <TableRow key={assignee} selectable={false}>
                  <TableRowColumn key={`${assignee}_name`}>{assignee}</TableRowColumn>
                  {this.props.statusList.map(status => {
                    const cellStyle = this.props.data[assignee][status].totalPoints > 0 ?
                      { backgroundColor: primary, color: white, padding: '0.5em', borderRadius: '10px' } : null;
                    return <TableRowColumn key={`${assignee}_${status}`}>
                      <span style={cellStyle}>
                        {`${this.props.data[assignee][status].totalPoints} Pts (${this.props.data[assignee][status].count}) `}
                      </span>
                      </TableRowColumn>
                  })}
                </TableRow>
              })}
            </TableBody>
          </Table>
        </Dialog>
      </div>
    );
  }
}
export default StatsModal;
