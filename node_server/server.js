var mongo = require('mongodb')
  , assert = require('assert')
  , bodyParser = require('body-parser')
  , Step = require('step')


var express = require('express');
var app = express();
var client = null;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

Step(
  function() {
    console.log("Open DB");
    var db = new mongo.Db('perf', new mongo.Server('localhost',27017, {}), {});
    db.open(this);
  },
  function(err, client) {
    if (err) { throw err; }

    console.log("Create collection");
    client.createCollection("perf_data", this);
  },
  function(err, collection) {
    if (err) { throw err; }

    app.post('/submit',function(req,res) {
      var data = JSON.parse(req.body["data"]);

      collection.insert(data);

      res.end();
    });

    var server = app.listen(3000, function () {

      var host = server.address().address;
      var port = server.address().port;

      console.log('Server listening at http://%s:%s', host, port);
    });
  }
);
