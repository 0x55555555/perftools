/* jshint -W097 */
"use strict";

var app = angular.module("graphexp", [
  'ngRoute',
  'ngAnimate',
  'xeditable',
  'ui.bootstrap'
]);

app.directive("contenteditable", function() {
  return {
    require: "ngModel",
    link: function(scope, element, attrs, ngModel) {
      function read() {
        const value = element.text().replace("\n", "");
        ngModel.$setViewValue(value);
      }

      ngModel.$render = function() {
        element.html(ngModel.$viewValue || "");
      };

      element.bind("blur keyup change", function() {
        scope.$apply(read);
      });
    }
  };
});

app.controller('main', function($scope) {

});

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      otherwise({
        templateUrl: 'partials/main.html',
        controller: 'main'
      });
  }]);

app.run(function (editableOptions, $rootScope, $location) {
  editableOptions.theme = 'bs3';
  var history = [];

  $rootScope.$on('$routeChangeSuccess', function() {
    history.push($location.$$path);
  });

  $rootScope.back = function () {
    var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
    $location.path(prevUrl);
  };
});


var draw = function(container, entries, data, x_range, observer) {
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var formatPercent = d3.format(".0%");

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(formatPercent);

  var area = d3.svg.area()
      .x(function(d) { return x(d.date); })
      .y0(function(d) { return y(d.y0); })
      .y1(function(d) { return y(d.y0 + d.y); });

  var stack = d3.layout.stack()
      .values(function(d) { return d.values; });

  container.selectAll("*").remove();
  var svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var browsers = stack(entries.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, y: d[name] / 100};
      })
    };
  }));

  x.domain(x_range);

  var browser = svg.selectAll(".browser")
      .data(browsers)
    .enter().append("g")
      .attr("class", "browser");

  browser.append("clipPath")
        .attr("id", "graph-clip") // give the clipPath an ID
      .append("rect")          // shape it as an ellipse
        .attr("x", x.range()[0])         // position the x-centre
        .attr("y", y.range()[1])         // position the y-centre
        .attr("width", x.range()[1])         // set the x radius
        .attr("height", y.range()[0]);         // set the y radius

  browser.append("path")
      .attr("class", "area")
      .attr("clip-path", "url(#graph-clip)")
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d) { return entries.color(d.name); });

  browser.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.y0 + d.value.y / 2) + ")"; })
      .attr("x", -6)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var line = svg.append("line")
    .attr("class", "pointer_location")
    .attr('y1', y.range()[0])
    .attr('y2', y.range()[1]);

  var selection = svg.append("rect")
    .attr("class", "pointer_selection")
    .attr("stroke", "black")
    .attr('y', y.range()[1])
    .attr('height', y.range()[0] - y.range()[1]);

  function select(x1, x2) {
    if (!x1) {
      selection.attr("display", "none");
      return;
    }

    selection.attr('x', Math.min(x1, x2));
    selection.attr('width', Math.abs(x2 - x1));
    selection.attr("display", "");
  }
  select(null, null);

  var select_origin = null;

  svg.on('mouseleave', function() {
    line.attr("display", "none");
  });

  svg.on('mousemove', function () {
     var x = d3.mouse(this)[0];
     line.attr("stroke-width", 2);
     line.attr('x1', x);
     line.attr('x2', x);
     line.attr("display", "");

     if (select_origin) {
       select(select_origin, x);
     }
  });

  svg.on('mousedown', function () {
     var x = d3.mouse(this)[0];
     select_origin = x;
  });

  svg.on('mouseup', function () {
    select();
    var select_end = d3.mouse(this)[0];
    observer.change_x_range(x.invert(select_origin), x.invert(select_end));
    select_origin = 0;
  });
};

app.controller('testCtrl', function($scope) {
    $scope.keys = {};
    $scope.x_range = [];
    $scope.expanded = true;


    d3.tsv("source/data.tsv", function(error, data) {
      if (error) throw error;

      $scope.reset_x = function() {
        $scope.x_range = d3.extent(data, function(d) { return d.date; });
      };

      var parseDate = d3.time.format("%y-%b-%d").parse;
      data.forEach(function(d) {
        d.date = parseDate(d.date);
      });
      $scope.reset_x();

      var colour = d3.scale.category20c();
      var keys = Object.keys(data[0]).slice(1);
      for (let i in keys) {
        $scope.keys[keys[i]] = {
          show: true,
          colour: colour(i)
        };
      }


      var entries = {
        domain: function() {
          return d3.keys($scope.keys).filter(function(key) { return $scope.keys[key].show === true; });
        },
        color: function(i) {
          return $scope.keys[i].colour;
        }
      };

      var observer = {
        change_x_range: function(x1, x2) {
          $scope.x_range = [x1, x2];
          $scope.$apply();
        }
      };

      var container = d3.select("body").select('#graph').select('#svg_container');

      $scope.$watch("keys", function(newValue, oldValue) {
        draw(container, entries, data, $scope.x_range, observer);
      }, true);

      $scope.$watch("x_range", function(newValue, oldValue) {
        draw(container, entries, data, $scope.x_range, observer);
      }, true);

      $scope.$apply();
    });
});
