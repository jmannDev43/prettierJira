import React, {Component} from 'react';
import GanttChart from './GanttChart';
import CircularProgress from 'material-ui/CircularProgress';
import { Card, CardTitle } from 'material-ui/Card';
import { withRouter, Redirect } from 'react-router-dom';

class Board extends Component {
  render() {
    if (!this.props.userToken) {
      return <Redirect to="/login"/>
    } else if (!this.props.jqlString) {
      return (
        <div className="row noResults">
          <div className="col col-sm-12">
            <Card>
              <CardTitle title="Enter JQL above to view results."/>
            </Card>
          </div>
        </div>
      )
    } else if (this.props.ganttData.seriesData.length) {
      return (
        <div id="statusOverview">
          <GanttChart
            chartId="Board_GanttChart"
            min={this.props.chartMin}
            max={this.props.chartMax}
            statusList={this.props.ganttData.statusList}
            seriesData={this.props.ganttData.seriesData}
          />
        </div>
      );
    }
    return <div style={{height: (window.innerHeight - 30), textAlign: 'center'}}>
      <CircularProgress size={300} thickness={7} style={{marginTop: '18em'}}/>
    </div>
  }
}

Board.defaultProps = {
  ganttData: {
    chartMinMax: {
      min: null,
      max: null,
    },
    statusList: [],
    seriesData: [],
  },
  chartMin: null,
  chartMax: null,
}

export default withRouter(Board);
