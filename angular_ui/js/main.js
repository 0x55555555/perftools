var ServerUrl = 'http://localhost:3000/';

var app = angular.module('myApp', [ 'd3' ]);

var Result = function(total, total_sq, min, max, count) {
  this.total = total;
  this.total_sq = total_sq;
  this.min = min;
  this.max = max;
  this.count = count;
};

Result.prototype.average = function() {
    return this.total / this.count;
};

Result.prototype.sd = function() {
    var mean_sq = this.total_sq / this.count;
    var mean = this.average();
    return Math.sqrt(mean_sq - mean * mean);
};

app.controller('ResultController', function($scope, $http) {
  $scope.data_sets = { };

  var add_data_set = function(path, start, data) {
    var parent = $scope.data_sets;
    for (var i = 0; i < path.length; ++i) {
      var name = path[i];
      if (!(name in parent)) {
        parent[name] = { };
      }

      if (i == path.length-1) {
        parent[start] = data;
      }

      parent = parent[name];
    }
  }

  var get_result = function(result) {
    $http({
      method: 'JSONP',
      url: ServerUrl + 'result?id=' + result.id + '&callback=JSON_CALLBACK'
    }).success(function(data, status) {
      for (var ctx_name in data.contexts) {
        var ctx = data.contexts[ctx_name];

        var parents = {};
        for (var res in ctx.results) {
          var results = ctx.results[res];
          parents[results.name] = results.parent;
        }

        var parentLists = {};
        for (var res in parents) {
          var path = [];
          parentLists[res] = path;
          var obj = res;
          while(obj = parents[obj]) {
            path.push(obj);
          }
          path.push(res);
        }

        for (var res in ctx.results) {
          var results = ctx.results[res];
          var path = [ data.recipe, ctx_name ].concat(parentLists[results.name]);

          if (results.total_time) {
            add_data_set(path.concat("offset"), ctx.start, new Result(
              results.total_time,
              results.total_time_sq,
              results.min_time,
              results.max_time,
              results.fire_count
            ));
          }

          if (results.total_offset_time) {
            add_data_set(path.concat("offset"), ctx.start, new Result(
              results.total_offset_time,
              results.total_offset_time_sq,
              results.min_offset_time,
              results.max_offset_time,
              results.fire_count
            ));
          }
        }
      }
      result.value = 4;
    }).error(function(data, status) {
      console.log("Error getting result summary info", data, status);
    });
  }

  var get_results = function(key, key_data) {
    $http({
      method: 'JSONP',
      url: ServerUrl + 'result_summary?recipe=' + key_data._id + '&callback=JSON_CALLBACK'
    }).success(function(data, status) {
      key_data.results = [];
      for (var i in data) {
        var result = {
           date: data[i].start,
           value: 0,
           id: data[i]._id
        };
        key_data.results.push(result);
        get_result(result);
      }
    }).error(function(data, status) {
      console.log("Error getting result summary info", data, status);
    });
  };

  var get_summary = function() {
    $http({
      method: 'JSONP',
      url: ServerUrl + 'summary?callback=JSON_CALLBACK'
    }).success(function(data, status) {
      for (var i in data) {
        data[i].results = [
          { date: data[i].first, value: 0 },
          { date: data[i].last, value: 0 },
        ];
        get_results(i, data[i]);
      }
      $scope.results = data;
    }).error(function(data, status) {
      console.log("Error getting summary info", data, status);
    });
  };

  get_summary();
});

app.directive("resultChart", [ "$parse", "$window", "d3Service", function($parse, $window, d3Service) {
  return {
    restrict: "E",
    link: function(scope, elem, attrs) {
      d3Service.d3().then(function(d3) {

        var padding = 20;
        var xScale, yScale, xAxisGen, yAxisGen;

        var rawSvg = elem[0];
        var svg = d3.select(rawSvg)
          .append("svg")
            .attr("width", 850)
            .attr("height", 200);

        var lines = svg.append("g");

        function setChartParameters(data) {

          var min = d3.min(data, function(d) {
            return d.first;
          });

          var max = d3.max(data, function(d) {
            return d.last;
          });

          xScale = d3.scale.linear()
              .domain([min, max])
              .range([padding, svg.attr("width") - padding]);

          yScale = d3.scale.linear()
              .domain([10, 0])
              .range([padding, svg.attr("height") - padding]);

          var format_date = function(d) {
            var date = new Date(d * 1000);
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
            var dd  = date.getDate().toString();

            var result = dd + "/" + mm + "/" + yyyy;
            if ((max - min) < 60*60*24*2) {
              result = date.getHours() + ":" + date.getMinutes() + " " + result;
            }

            return result;
          };

          xAxisGen = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(5)
              .tickFormat(format_date);

          yAxisGen = d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .ticks(5);
        }

        function process_data(data) {
          var output = [];
          for (var i in data) {
            var result = {
              date: data[i].date,
              value: data[i].value
            };

            if (i == 0) {
              result.last_date = data[i].date,
              result.last_value = 0
            }
            else {
              result.last_date = data[i-1].date,
              result.last_value = data[i-1].value
            }

            output.push(result);
          }

          return output;
        }

        function redrawLineChart(data) {
          lines.selectAll('*').remove();

          var data_point = lines.selectAll("circle")
            .data(data)
              .enter()
                .append("g")
                  .selectAll("circle")
                    .data(function(d) { return process_data(d.results); })
                      .enter();

          data_point.append("line")
            .attr("x1", function(d, i) { return xScale(d.date); })
            .attr("y1", function(d, i) { return yScale(d.value); })
            .attr("x2", function(d, i) { return xScale(d.last_date); })
            .attr("y2", function(d, i) { return yScale(d.last_value); })
            .style("stroke", "indigo")
            .style("stroke-width", 2);
          data_point.append("circle")
            .attr("cx", function(d, i) { return xScale(d.date); })
            .attr("cy", function(d, i) { return yScale(d.value); })
            .attr("r", 3)
            .style("fill", "purple");

          setChartParameters(data);
          svg.selectAll("g.x.axis").call(xAxisGen);
          svg.selectAll("g.y.axis").call(yAxisGen);
        }

        var exp = $parse(attrs.chartData);
        scope.$watch(exp, function(newVal, oldVal){
          inputData = newVal;
          redrawLineChart(newVal != undefined ? newVal : []);
        }, true);

        var inputData = exp(scope);
        inputData = inputData != undefined ? inputData : [];
        setChartParameters(inputData);
        redrawLineChart(inputData != undefined ? inputData : []);

        svg.append("svg:g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (svg.attr("height") - padding) + ")")
          .call(xAxisGen);

        svg.append("svg:g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + padding + ",0)")
          .call(yAxisGen);
        /*
        function drawLineChart() {

          setChartParameters();

          svg.append("svg:g")
           .attr("class", "x axis")
           .attr("transform", "translate(0,180)")
           .call(xAxisGen);

          svg.append("svg:g")
           .attr("class", "y axis")
           .attr("transform", "translate(20,0)")
           .call(yAxisGen);

          svg.append("svg:path")
           .attr({
               d: lineFun(salesDataToPlot),
               "stroke": "blue",
               "stroke-width": 2,
               "fill": "none",
               "class": pathClass
           });
        }*/

      });
    }
  };
}]);

app.run(function($rootScope) { });
