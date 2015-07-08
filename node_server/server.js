var mongo = require('mongodb')
  , assert = require('assert')
  , bodyParser = require('body-parser')
  , Step = require('step')

var db = new mongo.Db('perf', new mongo.Server('localhost',27017, {}), {});

var express = require('express');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.post('/submit',function(req,res) {
  var data = JSON.parse(req.body["data"]);

  Step(
    function() {
      db.open(this);
    },
    function(err, client) {
      if (err) { throw err; }
      client.createCollection("perf_data", this);
    },
    function(err, col) {
      if (err) { throw err; }
      col.insert(data);
    }
  );

  res.end();
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server listening at http://%s:%s', host, port);
});