import React, { Component } from 'react';
import Highcharts from '../third-party/highcharts-gantt';
import theme from '../third-party/themes/dark-unica';
import utils from '../utils';
// Apply the theme
Highcharts.setOptions(theme);

export default class GanttChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statusList: []
    };
  }
  componentDidMount() {
    this.updateChart();
    utils.addToolTipHandlers();
  }
  componentDidUpdate() {
    this.updateChart();
    utils.addToolTipHandlers();
  }
  updateChart() {
    let today = utils.convertDateToGanttFormat(new Date());
    this.chart = Highcharts.ganttChart(this.props.chartId, {
      xAxis: {
        currentDateIndicator: true,
        min: today - (this.props.min * utils.getDay()), // 19
        max: today + (this.props.max * utils.getDay()), // 14
      },
      yAxis: {
        staticScale: 50,
        labels: {
          enabled: true,
          align: 'left',
          useHTML: true,
          formatter: function () {
            const statuses = ['Backlog', 'Open', 'In Development', 'Waiting', 'Code Review', 'Dev Complete', 'QA Ready', 'Testing', 'Resolved', 'Closed']
            // convert to array
            const keys = Object.keys(this.axis.treeGridMap);
            const treeGridMapArr = [];
            for (let i = 0; i < keys.length; i++) {
              treeGridMapArr.push(this.axis.treeGridMap[i]);
            }
            let style;
            const statusInLabel = this.value.split(' (')[0];
            if (statuses.indexOf(statusInLabel) > -1) {
              style = 'color: #88c1ec';
              return `<div style="min-height: 40px !important;">
                <b style="${style}">${this.value}</b>
              </div>`
            }
            const issueDetails = treeGridMapArr.find(tgm => tgm && tgm.data.name === this.value);
            const storyPoints = issueDetails.data.fields.customfield_10105 || 0;
            const assignee = issueDetails.data.fields.assignee ? issueDetails.data.fields.assignee.displayName : 'Unassigned';
            const issueType = issueDetails.data.fields.issuetype.name;
            style = 'line-height: 3.6em';
            const assigneeColor = assignee === 'Unassigned' ? '#991810' : 'dimgrey';
            //<img style="margin-left: 10px; border-radius: 50% !important; border: 2px;" src="${issueDetails.data.fields.assignee.avatarUrls['24x24']}" \>
            return `<div class="issueRow" style="min-height: 40px !important;">
                ${utils.getIssueTypeHtml(issueType)}
                <b class="issueLabel" style="${style}" data-tooltip="(${issueDetails.data.fields.issuetype.name}) ${issueDetails.data.fields.summary}">${this.value}</b>                
                <span style="background: ${assigneeColor}; padding: 0.25em; border-radius: 10px;">
                    ${assignee} (<span style="color: #ec8324;">${storyPoints}</span> Pts)
                </span>
              </div>`;
          }
        }
      },
      series: this.props.seriesData
    });
  }

  render() {
    return (
    <div>
      <div id={this.props.chartId}></div>
      <div id="tooltip"></div>
    </div>
    )
  }
};

