var mongo = require('mongodb')
  , assert = require('assert')
  , bodyParser = require('body-parser')
  , Step = require('step')

var db = new mongo.Db('perf', new mongo.Server('localhost',27017, {}), {});

var express = require('express');
var app = express();
var client = null;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit',function(req,res) {
  var data = JSON.parse(req.body["data"]);

  Step(
    function() {
      client.createCollection("perf_data", this);
    },
    function(err, col) {
      if (err) { throw err; }
      col.insert(data);
    }
  );

  res.end();
});

db.open(function(err, db) {
  if (err) { throw err; }
  client = db
  console.log("Opened db");

  var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Server listening at http://%s:%s', host, port);
  });
});
