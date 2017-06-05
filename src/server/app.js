import express from 'express';
import rp from 'request-promise-native';

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


function getRequestOptions(domain, userToken, filters, startAt, maxResults) {
  const fieldsAndExpand = '&fields=customfield_10105,project,resolutiondate,status,key,summary,issuetype,priority,assignee,created&expand=changelog';
  let uri = `https://jira.${domain}/rest/api/2/search?jql=${encodeURIComponent(filters)}${fieldsAndExpand}`;
  if (startAt) {
    uri = `${uri}&startAt=${startAt}&maxResults=50`;
  }
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Basic ${userToken}`
    },
    uri: uri,
    method: 'GET'
  };
  return options;
}

app.get('/api/:domain/:userToken/:jql', (req, res) => {
  let initialResults;
  const domain = req.params.domain;
  const userToken = req.params.userToken;
  const jqlString = req.params.jql;
  if (userToken && jqlString) {
    rp(getRequestOptions(domain, userToken, jqlString)).then(results => {
      initialResults = JSON.parse(results);
      if (initialResults.total > 50) {
        const maxResults = results.total - 50;
        rp(getRequestOptions(domain, userToken, jqlString, 50, maxResults))
          .then(moreResults => {
            const secondaryResults = JSON.parse(moreResults);
            console.log('moreResults.issues.length', secondaryResults.issues.length);
            initialResults.issues.push(...secondaryResults.issues);
            res.send(initialResults);
          }).catch(err => {
          console.log('err', err);
        });
      } else {
        res.send(results);
      }
    }).catch(err => {
      console.log('err', err);
    });
  }
});

app.get('/api/login/:domain/:username/:password', (req, res) => {
  const uri = `https://jira.${req.params.domain}/rest/auth/1/session`;
  const options = {
    body: {
      username: req.params.username,
      password: req.params.password,
    },
    json: true,
    uri: uri,
    method: 'POST'
  };
  rp(options).then(results => {
    res.send(results);
  }).catch(err => {
    console.log('err', err);
  });
});

export default app;
