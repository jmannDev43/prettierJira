import moment from 'moment';
// import business from 'moment-business';

const calculateEndFromStoryPoints = (start, storyPoints) => {
  const storyPointsToDays = {
    0: 0,
    0.5: .25,
    1: .5,
    2: 1,
    3: 1.5,
    5: 3,
    8: 7,
    13: 14,
  }
  const addAmount = storyPointsToDays[storyPoints] || 2;
  const startDate = new Date(start);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Math.max(addAmount, 2));
  return endDate;
}

const getDay = () => (1000 * 60 * 60 * 24);

const customRound = function (value, decimals) {
  return Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);
};

const convertDateToGanttFormat = (dateInput) => {
  const date = new Date(dateInput);
  date.setUTCHours(0);
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
  return date.getTime();
}

const transformIssueResults = (results) => {
  return results.issues.map(issue => {
    const combinedInfo = issue.changelog.histories.map(history => {
      const items = history.items.map(item => {
        return {
          created: convertDateToGanttFormat(history.created),
          ...item
        }
      });
      return items;
    });

    const flattendStatusesWithDate = Array.prototype.concat(...combinedInfo)
    const currentStatusObject = flattendStatusesWithDate.find(s => s.toString === issue.fields.status.name);
    // const currentStatusObject = flattendStatusesWithDate.find(s => s.toString === 'In Development');
    const startDate = currentStatusObject ? currentStatusObject.created : issue.fields.created;
    const start = convertDateToGanttFormat(startDate);
    let end = convertDateToGanttFormat(calculateEndFromStoryPoints(startDate, issue.fields.customfield_10105));
    end = Math.max(end, (convertDateToGanttFormat(new Date()) - 14 * getDay()))
    const today = convertDateToGanttFormat(new Date());
    let completed = moment(today).diff(moment(start), 'days') / moment(end).diff(moment(start), 'days')
    completed = customRound(completed, 2);
    return {
      ...issue,
      start,
      taskName: issue.key,
      parent: issue.fields.status.name.replace(/\s+/g,'_').toLowerCase(),
      completed: {
        amount: completed > 1 ? 1 : completed,
      },
      end
    }
  });
}

const getChartMinMax = (transformedIssues) => {
  return transformedIssues.reduce((acc, currentIssue) => {
    acc['min'] = acc['min'] ?
      Math.min(acc['min'], currentIssue.start) :
      currentIssue.start;
    acc['max'] = acc['max'] ?
      Math.max(acc['max'], currentIssue.start) :
      currentIssue.start;
    return acc;
  }, { min: null, max: null });
}

const getStatusAggregates = (statusAccumulator, transformedIssues, statusList) => {
  return transformedIssues.reduce((acc, currentIssue) => {
    const status = currentIssue.fields.status.name;
    if (statusList.indexOf(status) > -1) {
      const infoByStatus = statusAccumulator[status];
      // Start
      // infoByStatus['start'] = infoByStatus['start'] ?
      //   Math.min(infoByStatus['start'], currentIssue.start) :
      //   currentIssue.start;
      // // End
      // infoByStatus['end'] = infoByStatus['end'] ?
      //   Math.max(infoByStatus['end'], currentIssue.start) :
      //   currentIssue.start;
      // Refactor this ugliness.........
      // const proejct = currentIssue.fields.project;
      // const issueType =
      const assignee = currentIssue.fields.assignee ? currentIssue.fields.assignee.displayName : 'Unassigned';
      if (!infoByStatus['assignee'][assignee]) {
        infoByStatus['assignee'][assignee] = {
          count: 0,
          totalPoints: 0
        };
      }
      // =====================================
      // Project
      infoByStatus['project'][currentIssue.fields.project.name] =
        infoByStatus['project'][currentIssue.fields.project.name] ?
        infoByStatus['project'][currentIssue.fields.project.name] + 1 : 1;
      // Issue Type
      infoByStatus['issueType'][currentIssue.fields.issuetype.name] =
        infoByStatus['issueType'][currentIssue.fields.issuetype.name] ?
        infoByStatus['issueType'][currentIssue.fields.issuetype.name] + 1 : 1;
      // Assignee, for now just counting issues, not adding story points by assignee...

      infoByStatus['assignee'][assignee].count += 1;
      infoByStatus['assignee'][assignee].totalPoints +=(currentIssue.fields.customfield_10105 || 0);

      // Story points
      infoByStatus['storyPoints'] =
        (infoByStatus['storyPoints'] || 0) + (currentIssue.fields.customfield_10105 || 0);
      // Could also do by priority, leaving for now...
    }
    return statusAccumulator;
  }, statusAccumulator);
}

const getAggregatesByAssignee = (transformIssueResults, statuses) => {
  return transformIssueResults.reduce((acc, currentIssue) => {
    const assignee = currentIssue.fields.assignee ? currentIssue.fields.assignee.displayName : 'Unassigned';
    const status = currentIssue.fields.status.name;
    if (!acc[assignee]) {
      acc[assignee] = {};
      statuses.forEach(status => {
        acc[assignee][status] = {
          count: 0,
          totalPoints: 0,
        };
      });
    }
    acc[assignee][status].count += 1;
    acc[assignee][status].totalPoints += (currentIssue.fields.customfield_10105 || 0);
    return acc;
  }, {});
}

const getChartData = (results) => {
  const statusAccumulator = {
    Backlog: { start: null, end: null, storyPoints: 0, project: {}, issueType: {}, assignee: {} },
    Open: { start: null, end: null, storyPoints: 0, project: {}, issueType: {}, assignee: {} },
    'In Development': { start: null, end: null, storyPoints: 0, project: {}, issueType: {}, assignee: {} },
    Waiting: { start: null, end: null, storyPoints: 0, project: {}, issueType: {}, assignee: {} },
    'Code Review': { start: null, end: null, storyPoints: 0, project: {}, issueType: {}, assignee: {} },
    'Dev Complete': { start: null, end: null, storyPoints: 0, project: {}, issueType: {}, assignee: {} },
    'QA Ready': { start: null, end: null, storyPoints: 0, project: {}, issueType: {}, assignee: {} },
    Testing: { start: null, end: null, storyPoints: 0, project: {}, issueType: {}, assignee: {} },
    Resolved: { start: null, end: null, storyPoints: 0, project: {}, issueType: {}, assignee: {} },
    Closed: { start: null, end: null, storyPoints: 0, project: {}, issueType: {}, assignee: {} },
  }
  const statusList = Object.keys(statusAccumulator);
  const transformedIssues = transformIssueResults(results);
  const statusAggregates = getStatusAggregates(statusAccumulator, transformedIssues, statusList);
  let seriesData = Object.keys(statusAggregates).map(key => {
    statusAggregates[key]['name'] = key;
    statusAggregates[key]['data'] = [{
      taskName: `${key} (${statusAggregates[key].storyPoints} Pts)`,
      type: 'status',
      id: key.replace(/\s+/g,'_').toLowerCase(),
      ...statusAggregates[key]
    }];
    return statusAggregates[key];
  }).sort((a, b) => {
    return statusList.indexOf(a) - statusList.indexOf(b);
  });
  const chartMinMax = getChartMinMax(transformedIssues);
  transformedIssues.forEach(t => {
    const series = seriesData.find(s => s.name === t.fields.status.name);
    series.data.push(t);
  });
  seriesData.forEach(s => {
    const min = Math.min.apply(null, s.data.filter((d, i) => i > 0 && !!d).map(d => d.start));
    const max = Math.max.apply(null, s.data.filter((d, i) => i > 0 && !!d).map(d => d.end));
    const completedArray = s.data.filter((d, i) => i > 0 && !!d).map(d => d.completed.amount);
    const totalStoryPoints = completedArray.length ? completedArray.reduce((acc, curr) => acc += curr) : 0;
    const completed = totalStoryPoints / completedArray.length;
    s.data[0].start = min;
    s.data[0].end = max;
    s.data[0].completed = {
      amount: customRound(completed, 2)
    };
  });
  const aggregatesByAssignee = getAggregatesByAssignee(transformedIssues, Object.keys(statusAggregates))
  return { statusList, chartMinMax, seriesData, aggregatesByAssignee };
}

// https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
const hexToRgbA = (hex, alpha) => {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = `0x${c.join('')}`;
    return `rgba(${[(c>>16)&255, (c>>8)&255, c&255].join(',')},${alpha})`;
  }
  throw new Error('Bad Hex');
}

const getIssueTypeHtml = (issueType) => {
  const map = {
    Bug: '<i class="fa fa-bug fa-lg" style="color: #ff4852"></i>',
    Story: '<i class="fa fa-book fa-lg" style="color: #07a3d1"></i>',
    Task: '<i class="fa fa-list-ul fa-lg" style="color: #31d156"></i>',
  }
  return map[issueType];
}

const showToolTip = (event) => {
  const target = event.target;
  const content = target.getAttribute('data-tooltip');
  const tooltip = document.getElementById('tooltip');
  tooltip.innerText = content;
  tooltip.style.display = 'block';
  const pageScroll = document.body.scrollTop;
  tooltip.style.top = `${event.y + pageScroll}px`;
  tooltip.style.left = `${event.x}px`;
}

const hideToolTip = (event) => {
  const tooltip = document.getElementById('tooltip');
  tooltip.innerText = '';
  tooltip.style.display = 'none';
}

// https://gist.github.com/beaucharman/1f93fdd7c72860736643d1ab274fee1a
const debounce = (callback, wait, context = this) => {
  let timeout = null
  let callbackArgs = null

  const later = () => callback.apply(context, callbackArgs)

  return function() {
    callbackArgs = arguments
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const addToolTipHandlers = () => {
  const classnameElements = document.getElementsByClassName('issueLabel');
  [].forEach.call(classnameElements, (classnameElement) => {
    classnameElement.addEventListener('mouseover', debounce(showToolTip, 200));
    classnameElement.addEventListener('mouseout', debounce(hideToolTip, 200));
  });
}

export default {
  getChartData,
  hexToRgbA,
  convertDateToGanttFormat,
  getDay,
  getIssueTypeHtml,
  addToolTipHandlers,
};
