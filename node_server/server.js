var mongo = require('mongodb')
  , assert = require('assert')
  , bodyParser = require('body-parser')
  , Step = require('step')
var ObjectId = mongo.ObjectId;


var express = require('express');
var app = express();
var client = null;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("jsonp callback", true);

var ui_path = "angular_ui/"
var static_path = __dirname + '/../' + ui_path;
app.use(express.static(static_path));

Step(
  function() {
    console.log("Open DB");
    var db = new mongo.Db('perf', new mongo.Server('localhost',27017, {}), {});
    db.open(this);
  },
  function(err, client) {
    assert.equal(err, null);

    console.log("Create collection");
    client.createCollection("perf_data", this);
  },
  function(err, collection) {
    assert.equal(err, null);

    app.post('/submit',function(req, res) {
      var data = JSON.parse(req.body["data"]);

      collection.insert(data);

      res.end();
    });

    app.get('/summary', function(req, res) {
      collection.aggregate(
        [
          {
            $group: {
              _id: "$recipe",
              description: { $last: "$recipe_description" },
              first: { $min: "$start" },
              last: { $max: "$start" }
            }
          }
        ]
      ).toArray(function(err, result) {
        assert.equal(err, null);
        res.jsonp(result);
      });
    });

    app.get('/result_summary', function(req, res) {
      collection.find(
        { recipe: req.query.recipe },
        { _id:1, start: 1 }
      ).toArray(function(err, result) {
        assert.equal(err, null);
        res.jsonp(result);
      });
    });

    app.get('/result', function(req, res) {
      collection.find(
        { _id: ObjectId(req.query.id) }
      ).toArray(function(err, result) {
        assert.equal(err, null);
        if (result.length == 1) {
          res.jsonp(result[0]);
        }
        else {
          res.status(500);
          res.jsonp({});
        }
      });
    });

    var server = app.listen(3000, function () {

      var host = server.address().address;
      var port = server.address().port;

      console.log('Server listening at http://%s:%s', host, port);
    });
  }
);
