'use strict';

var app = angular.module('myApp', ['d3']);
'use strict';

angular.module('d3', []).factory('d3Service', ['$document', '$q', '$rootScope', '$window', function ($document, $q, $rootScope, $window) {
    var d = $q.defer();

    function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function () {
            d.resolve($window.d3);
        });
    }
    // Create a script tag with d3 as the source
    // and call our onScriptLoad callback when it
    // has been loaded

    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.js';
    scriptTag.charset = 'utf-8';

    scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') onScriptLoad();
    };

    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    return {
        d3: function d3() {
            return d.promise;
        }
    };
}]);
"use strict";

var DataSet = function DataSet() {
  this.results = [];
  this._start = null;
  this._end = null;
};

DataSet.prototype.push = function (result) {
  this.results.push(result);

  if (!this._start || result.start < this._start) {
    this._start = result.start;
  }

  if (!this._end || result.start > this._end) {
    this._end = result.start;
  }
};

DataSet.prototype.start = function () {
  return this._start;
};

DataSet.prototype.end = function (result) {
  return this._end;
};

var DataSetMetaData = function DataSetMetaData() {
  this.show = true;
};
"use strict";

var HoverEffect = function HoverEffect(parent, xScale, yScale, get_x, get_y, format_x, format_y) {
  var group = parent.append("g");

  var x = group.append("line").style({
    "stroke": 'black',
    "stroke-width": 2,
    "fill": "none"
  });

  var y = group.append("line").style({
    "stroke": 'black',
    "stroke-width": 2,
    "fill": "none"
  });

  this.hide = function (d) {
    group.transition().duration(400).ease("linear").attr('opacity', 0.0);
  };

  this.show = function (d) {
    group.transition().duration(400).ease("linear").attr('opacity', 1.0);

    x.transition().duration(100).ease("linear").attr({
      'x1': get_x(d),
      'y1': get_y(d),
      'x2': get_x(d),
      'y2': yScale.range()[1]
    });

    y.transition().duration(100).ease("linear").attr({
      'x1': get_x(d),
      'y1': get_y(d),
      'x2': xScale.range()[0],
      'y2': get_y(d)
    });
  };
};

app.directive("resultChartData", ["d3Service", function (d3Service) {
  return {
    restrict: "A",
    link: function link($scope, $elem, $attrs) {
      d3Service.d3().then(function (d3) {
        var display_data = $scope.display_data;
        var colour = $scope.colour;
        var results = $scope.data;
        var xScale = $scope.x_scale;
        var yScale = $scope.y_scale;

        var current_x = function current_x(d, i) {
          return xScale(d.x);
        };
        var current_y = function current_y(d, i) {
          return yScale(d.y);
        };
        var current_y_sd_min = function current_y_sd_min(d) {
          return yScale(d.y - d.y_sd);
        };
        var current_y_sd_max = function current_y_sd_max(d) {
          return yScale(d.y + d.y_sd);
        };
        var current_y_min = function current_y_min(d, i) {
          return yScale(d.y_min);
        };
        var current_y_max = function current_y_max(d, i) {
          return yScale(d.y_max);
        };

        var graph = d3.select($elem[0]);

        var hover = new HoverEffect(graph, xScale, yScale, current_x, current_y);

        // Add an area for the sd around the mean.
        if (display_data.range) {
          var area = d3.svg.area().x(current_x).y0(current_y_sd_min).y1(current_y_sd_max);

          graph.append("path").attr({
            'd': area(results),
            'fill-opacity': 0.2,
            'fill': colour
          });
        }

        // Add a line for the mean
        if (display_data.average) {
          var line = d3.svg.line().x(current_x).y(current_y).interpolate("basis");

          graph.append("path").attr({ 'd': line(results) }).style({
            "stroke": colour,
            "stroke-width": 2,
            "fill": "none"
          });
        }

        // Setup members for per point ren
        var data_point = graph.selectAll("g").data(results).enter().append("g");

        // Add min and max lines through points
        if (display_data.minmax) {
          data_point.append("line").attr("x1", current_x).attr("y1", current_y_min).attr("x2", current_x).attr("y2", current_y_max).style("stroke", colour).style("stroke-opacity", 0.3).style("stroke-width", 1);
        }

        // add points for means
        if (display_data.average) {
          data_point.append("circle").attr("cx", current_x).attr("cy", current_y).attr("r", 5).style("fill", 'white').style("fill-opacity", 0.8).on("mouseover", hover.show).on("mouseout", hover.hide);
          data_point.append("circle").attr("cx", current_x).attr("cy", current_y).attr("r", 3).style("fill", colour).on("mouseover", hover.show).on("mouseout", hover.hide);
        }

        var detail = {
          show: function show() {
            data_point.attr('opacity', 1.0);
            console.log("show");
          },
          hide: function hide() {
            data_point.attr('opacity', 0.0);
            console.log("hide");
          }
        };
      });
    }
  };
}]);

app.directive("resultChart", ["$parse", "$compile", "d3Service", function ($parse, $compile, d3Service) {
  return {
    restrict: "E",
    scope: {
      data: "&",
      range: "&"
    },
    link: function link($scope, $elem, $attrs) {
      d3Service.d3().then(function (d3) {

        var padding = 40;
        var xScale, yScale, xAxisGen, yAxisGen, inputData, xRange;

        var root = $elem[0];
        var svg = d3.select(root).append("svg").attr("width", 850).attr("height", 400);

        var clip = svg.append("defs").append("clipPath").attr("id", "graphClip").append("rect");

        var graphs = svg.append("g");
        var refreshClip = function refreshClip() {
          var x = xScale.range();
          var y = yScale.range();
          clip.attr("x", x[0]).attr("y", y[0]).attr("width", x[1] - x[0]).attr("height", y[1] - y[0]);

          graphs.attr("clip-path", "url(#graphClip)");
        };

        function redrawLineChart() {
          if (!xRange || !inputData) {
            return;
          }

          graphs.selectAll('*').remove();

          var graphs_selection = graphs.selectAll("svg").data(inputData.results);

          var range = xRange.safe().range;

          xScale = d3.scale.linear().domain(xRange.safe().range).range([padding, svg.attr("width") - padding]);

          yScale = d3.scale.linear().domain(inputData.y.invert().range).range([padding, svg.attr("height") - padding]);
          refreshClip();

          graphs_selection.exit().remove();
          graphs_selection.enter().append("g").select(function (d, i) {
            this.appendChild($compile("<svg data-result-chart-data></svg>")({
              data: d.data,
              display_data: inputData.display,
              x_scale: xScale,
              y_scale: yScale,
              colour: d.colour
            })[0]);
          });

          xAxisGen = d3.svg.axis().scale(xScale).orient("bottom").ticks(inputData.y.tickCount()).tickFormat(inputData.x.format);

          yAxisGen = d3.svg.axis().scale(yScale).orient("left").ticks(inputData.y.tickCount()).tickFormat(inputData.y.format);

          svg.selectAll("g.x.axis").call(xAxisGen);
          svg.selectAll("g.y.axis").call(yAxisGen);
        }

        $scope.$watch(function (s) {
          return $scope.data() ? $scope.data().results : null;
        }, function (newVal, oldVal) {
          inputData = newVal;
          redrawLineChart();
        }, true);

        $scope.$watch(function (s) {
          return s.range();
        }, function (newVal, oldVal) {
          xRange = newVal;
          redrawLineChart();
        }, true);

        svg.append("svg:g").attr("class", "x axis").attr("transform", "translate(0," + (svg.attr("height") - padding) + ")");

        svg.append("svg:g").attr("class", "y axis").attr("transform", "translate(" + padding + ",0)");
      });
    }
  };
}]);
'use strict';

var ServerUrl = 'http://localhost:3000/';

app.controller('ResultController', function ($scope, $http, Result, ResultRange, ResultSet) {
  $scope.data_set_tree = {};
  $scope.data_sets = { results: {} };
  $scope.data_sets_meta_data = {};
  $scope.range = new ResultRange();
  $scope.view = new ResultSet();

  var add_to_data_set = function add_to_data_set(path, data) {
    var parent = $scope.data_set_tree;
    var result_path = "";
    for (var i = 0; i < path.length; ++i) {
      var name = path[i];
      result_path += "::" + name;

      if (i == path.length - 1) {
        if (!(name in parent)) {
          var ds = new DataSet();
          parent[name] = ds;
          $scope.data_sets.results[result_path] = ds;
          $scope.data_sets_meta_data[result_path] = new DataSetMetaData();

          $scope.view.process($scope.data_sets);
        }
        parent[name].push(data);
      } else {
        if (!(name in parent)) {
          parent[name] = {};
        }
      }

      parent = parent[name];
    }
  };

  var get_result = function get_result(result) {
    $http({
      method: 'JSONP',
      url: ServerUrl + 'result?id=' + result.id + '&callback=JSON_CALLBACK'
    }).success(function (data, status) {
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
          while (obj = parents[obj]) {
            path.push(obj);
          }
          path.push(res);
        }

        for (var res in ctx.results) {
          var results = ctx.results[res];
          var path = [data.recipe, ctx_name].concat(parentLists[results.name]);

          if (results.total_time) {
            add_to_data_set(path.concat("duration"), new Result(ctx.start, ctx.machine_identity, results.total_time, results.total_time_sq, results.min_time, results.max_time, results.fire_count));
          }

          if (results.total_offset_time) {
            add_to_data_set(path.concat("offset"), new Result(ctx.start, ctx.machine_identity, results.total_offset_time, results.total_offset_time_sq, results.min_offset_time, results.max_offset_time, results.fire_count));
          }
        }
      }
      result.value = 4;
    }).error(function (data, status) {
      console.log("Error getting result summary info", data, status);
    });
  };

  var get_results = function get_results(key, key_data) {
    $http({
      method: 'JSONP',
      url: ServerUrl + 'result_summary?recipe=' + key_data._id + '&callback=JSON_CALLBACK'
    }).success(function (data, status) {
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
    }).error(function (data, status) {
      console.log("Error getting result summary info", data, status);
    });
  };

  var get_summary = function get_summary() {
    $http({
      method: 'JSONP',
      url: ServerUrl + 'summary?callback=JSON_CALLBACK'
    }).success(function (data, status) {
      for (var i in data) {
        data[i].results = [{ date: data[i].first, value: 0 }, { date: data[i].last, value: 0 }];
        get_results(i, data[i]);
      }
      $scope.results = data;
    }).error(function (data, status) {
      console.log("Error getting summary info", data, status);
    });
  };

  get_summary();
});
"use strict";

app.factory("ResultRange", function () {
  var ResultRange = function ResultRange(min, max) {
    this.range = [min, max];
    this.format = ResultRange.defaultFormat;
  };

  ResultRange.prototype.defaultFormat = function (val) {
    return val.toString();
  };

  ResultRange.prototype.tickCount = function (val) {
    return 5;
  };

  ResultRange.prototype.setMin = function (val) {
    this.range[0] = val;
  };

  ResultRange.prototype.setMax = function (val) {
    this.range[1] = val;
  };

  ResultRange.prototype.invert = function () {
    return new ResultRange(this.range[1], this.range[0]);
  };

  ResultRange.prototype.safe = function () {
    return new ResultRange(this.range[0] ? this.range[0] : 0, this.range[1] ? this.range[1] : 0);
  };

  ResultRange.prototype.expand = function (val) {
    if (this.range[0] == null || val < this.range[0]) {
      this.range[0] = val;
    }
    if (this.range[1] == null || val > this.range[1]) {
      this.range[1] = val;
    }
  };

  return ResultRange;
});
'use strict';

app.factory("ResultSet", function (ResultRange) {
  var ResultSet = null;
  ResultSet = function () {
    this.input = this.results = null;
    this._filter = function (set, result) {
      return true;
    };

    this.filters = ResultSet.FilterModes;
    for (this.filter in this.filters) break;

    this.groups = ResultSet.GroupModes;
    for (this.group in this.groups) break;

    this.sets = ResultSet.SetModes;
    for (this.set in this.sets) break;

    this.sorts = ResultSet.SortModes;
    for (this.sort in this.sorts) break;

    this._select = function (entry) {
      return {
        x: entry.starts[0],
        y: entry.average(),
        y_sd: entry.sd(),
        y_min: entry.min,
        y_max: entry.max
      };
    };
  };

  ResultSet.FilterModes = {
    'none': function none(set, result) {
      return true;
    }
  };

  ResultSet.GroupModes = {
    'start_second': function start_second(set, result) {
      return result.starts[0];
    },
    'start_week': function start_week(set, result) {
      var date = new Date(result.starts[0] * 1000);
      return date.getFullYear() + "_" + Math.floor(date.getDate() / 7);
    },
    'start_month': function start_month(set, result) {
      var date = new Date(result.starts[0] * 1000);
      return date.getFullYear() + "_" + date.getMonth();
    },
    'start_dow': function start_dow(set, result) {
      return new Date(result.starts[0] * 1000).getDay();
    },
    'start_dom': function start_dom(set, result) {
      return new Date(result.starts[0] * 1000).getDate();
    }
  };

  ResultSet.SetModes = {
    'data_sets': function data_sets(set, result) {
      return set;
    },
    'none': function none(set, result) {
      return 0;
    }
  };

  ResultSet.SortModes = {
    'x_increasing': function x_increasing(list) {
      list.sort(function (a, b) {
        return a.x - b.x;
      });
    }
  };

  ResultSet.prototype.reprocess = function (input) {
    this.process(this.input);
  };

  ResultSet.prototype.process = function (input) {
    this.input = input;
    var x_range = new ResultRange();
    var y_range = new ResultRange();

    var results = {};

    var set_fn = this.sets[this.set];
    var sort_fn = this.sorts[this.sort];
    var filter_fn = this.filters[this.filter];
    var group_fn = this.groups[this.group];

    for (var i in input.results) {
      var data_set = input.results[i];
      for (var r in data_set.results) {
        var result = data_set.results[r];
        if (!filter_fn(r, result)) {
          continue;
        }

        var set = set_fn(i, result);
        var results_set = results[set];
        if (results_set == null) {
          results_set = {};
          results[set] = results_set;
        }

        var grp = group_fn(r, result);

        if (results_set.hasOwnProperty(grp)) {
          results_set[grp] = Result.combine(results_set[grp], result);
        } else {
          results_set[grp] = Result.clone(result);
        }
      }
    }

    var result_list = [];
    for (var set_name in results) {
      var set = results[set_name];
      var set_list = [];
      result_list.push({ data: set_list, colour: "#" + ((1 << 24) * Math.random() | 0).toString(16) });
      for (var key in set) {
        var sel = this._select(set[key]);
        set_list.push(sel);

        x_range.expand(sel.x);
        y_range.expand(sel.y_min);
        y_range.expand(sel.y_max);
      }

      sort_fn(set_list);
    }

    x_range.format = function (d) {
      var date = new Date(d * 1000);
      var yyyy = date.getFullYear().toString();
      var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
      var dd = date.getDate().toString();

      var result = dd + "/" + mm + "/" + yyyy;
      if (x_range.range[1] - x_range.range[0] < 60 * 60 * 24 * 2) {
        result = date.getHours() + ":" + date.getMinutes() + " " + result;
      }

      return result;
    };

    this.results = new ResultViewParams(result_list, x_range, y_range);
  };

  return ResultSet;
});
"use strict";

app.factory("ResultViewParams", function (utils) {
  var ResultViewParams = function ResultViewParams(results, x_range, y_range) {
    this.results = results;
    this.x = x_range;
    this.y = y_range;
    this.display = {
      "average": true,
      "range": true,
      "minmax": true
    };
  };
  return ResultViewParams;
});
"use strict";

app.factory("Result", function (utils) {
  var Result = function Result(start, identity, total, total_sq, min, max, count) {
    if (start instanceof Array) {
      this.starts = start;
    } else {
      this.starts = [start];
    }

    if (identity instanceof Array) {
      this.machine_identities = identity;
    } else {
      this.machine_identities = [identity];
    }
    this.total = total;
    this.total_sq = total_sq;
    this.min = min;
    this.max = max;
    this.count = count;
  };

  Result.prototype.average = function () {
    return this.total / this.count;
  };

  Result.prototype.sd = function () {
    var mean_sq = this.total_sq / this.count;
    var mean = this.average();
    return Math.sqrt(mean_sq - mean * mean);
  };

  Result.clone = function (a) {
    return new Result(utils.clone_array(a.starts), utils.clone_array(a.machine_identities), a.total, a.total_sq, a.min, a.max, a.count);
  };

  Result.combine = function (a, b) {
    var cloned = Result.clone(a);

    cloned.starts = cloned.starts.concat(b.starts);
    cloned.machine_identities = cloned.machine_identities.concat(b.machine_identities);
    cloned.total += b.total;
    cloned.total_sq += b.total_sq;
    cloned.min = Math.min(cloned.min, b.min);
    cloned.max = Math.max(cloned.max, b.max);
    cloned.count += b.count;

    return cloned;
  };

  return Result;
});
"use strict";

app.factory("utils", function () {
    return {
        clone_array: function clone_array(map) {
            return arr.slice(0);
        }
    };
});
"use strict";

app.directive("viewEditor", ["d3Service", function (d3Service) {
  return {
    restrict: "E",
    scope: {
      view: "="
    },
    templateUrl: '/templates/view-editor.html',
    link: function link($scope, $elem, $attrs) {
      $scope.reprocess = function () {
        $scope.view.reprocess();
      };
    }
  };
}]);
"use strict";

var DragHandle = function DragHandle(parent, data) {

  var dragright = d3.behavior.drag().origin(Object).on("drag", rdragresize);

  var sync = function sync() {
    dragbarright.attr("x", function (d) {
      return data.value - data.width / 2;
    });
    dragbarright.attr("width", function (d) {
      return data.width;
    });
  };

  this.sync = sync;

  function rdragresize(d) {
    var min = data.min();
    var max = data.max();
    data.value = Math.max(min, Math.min(max, data.value + d3.event.dx));
    sync();
    data.changed();
  }

  var dragbarright = parent.append("rect").attr("x", function (d) {
    return data.value - data.width / 2;
  }).attr("y", function (d) {
    return 10;
  }).attr("id", "dragright").attr("height", 30).attr("width", data.width).attr("fill", "gray").attr("stroke", "black").attr("stroke-width", 1.0).attr("cursor", "ew-resize").call(dragright);
};

app.directive("zoomChart", ["$parse", "$compile", "d3Service", function ($parse, $compile, d3Service) {
  return {
    restrict: "E",
    scope: {
      data: "&",
      range: "="
    },
    link: function link($scope, $elem, $attrs) {
      d3Service.d3().then(function (d3) {

        var padding = 40;
        var xScale, yScale, xAxisGen, yAxisGen;

        var root = $elem[0];
        var svg = d3.select(root).append("svg").attr("width", 850).attr("height", 50);

        var selectors = svg.append("g");

        function redrawLineChart(range) {
          if (!$scope.data().results) {
            return;
          }

          selectors.selectAll('*').remove();

          xScale = d3.scale.linear().domain(range).range([padding, svg.attr("width") - padding]);

          xAxisGen = d3.svg.axis().scale(xScale).orient("bottom").ticks(5).tickFormat($scope.data().results.x.format);

          svg.selectAll("g.x.axis").call(xAxisGen);

          var _min = xScale.range()[0];
          var _max = xScale.range()[1];
          var current_min = {
            value: _min,
            width: 7
          };
          var current_max = {
            value: _max,
            width: 7
          };
          var centre = {
            min: function min() {
              return _min;
            },
            max: function max() {
              return _max;
            }
          };

          current_min.min = function () {
            return _min;
          };
          current_min.max = function () {
            return current_max.value - current_max.width;
          };
          current_max.min = function () {
            return current_min.value + current_min.width;
          };
          current_max.max = function () {
            return _max;
          };

          var update_centre = function update_centre(handles) {
            centre.value = (current_max.value + current_min.value) / 2;
            centre.width = current_max.value - current_min.value - (handles ? current_min.width : 0.0);
          };
          update_centre(true);

          var update_scope = function update_scope(apply) {
            $scope.range.setMin(xScale.invert(current_min.value));
            $scope.range.setMax(xScale.invert(current_max.value));
            if (apply) {
              $scope.$apply();
            }
          };
          update_scope(false);

          current_min.changed = current_max.changed = function () {
            update_centre();
            centre_handle.sync();
            update_scope(true);
          };

          centre.changed = function () {
            current_min.value = Math.max(current_min.min(), centre.value - centre.width / 2);
            current_max.value = Math.min(current_max.max(), centre.value + centre.width / 2);

            min_handle.sync();
            max_handle.sync();
            update_centre(false);
            update_scope(true);
          };

          var centre_handle = new DragHandle(selectors, centre);
          var min_handle = new DragHandle(selectors, current_min);
          var max_handle = new DragHandle(selectors, current_max);
        }

        $scope.$watch(function () {
          var data = $scope.data() ? $scope.data().results : null;
          return data ? data.x.range : [0, 0];
        }, function (newVal, oldVal) {
          inputData = newVal;
          redrawLineChart(newVal != undefined ? newVal : []);
        }, true);

        svg.append("svg:g").attr("class", "x axis").attr("transform", "translate(0,25)");
      });
    }
  };
}]);
//# sourceMappingURL=all.js.map