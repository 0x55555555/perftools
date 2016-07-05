"use strict";
const express = require('express')
    , Session = require('./lib/session.js')
    , app = express();

app.use(express.static(__dirname + '/../dist'));

app.get('/sessions', function (req, res) {
  let sessions = {
    sessions: [
      new Session("session-a"),
      new Session("session-b"),
      new Session("session-c"),
    ]
  };
  res.send(JSON.stringify(sessions));
});

app.get('/session/*', function (req, res) {

  var dateNow = new Date();

  let graph_data = [
    {'date': new Date(dateNow.getTime() - 100*1000), 'x': 0, 'y': 0},
    {'date': new Date(dateNow.getTime() - 74 *1000), 'x': 1, 'y': 1},
    {'date': new Date(dateNow.getTime() - 60 *1000), 'x': 2, 'y': 2},
    {'date': new Date(dateNow.getTime() - 50 *1000), 'x': 1, 'y': 1},
  ];
  let session = {
    title: 'session-a',
    source: "XXX",
    graphs: [
      {
        title: "TEST4",
        data: graph_data,
        type: 'stack',
        yformat: '%',
      },
      {
        title: "TEST5",
        data: graph_data,
        type: 'line',
        yformat: ".2f",
      },
    ],
  };
  res.send(JSON.stringify(session));
});

app.use('/source/', express.static(__dirname + '/../web/'));

const port = process.env.PORT || 3000;
console.log(`Listening on ${port}`);
app.listen(port);
