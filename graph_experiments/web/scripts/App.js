/* jshint -W097 */
"use strict";

var app = angular.module("graphexp", [
  'ngRoute',
  'ngAnimate'
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

app.controller("mainController", function($scope) {
  $scope.graphs = [];
  $scope.view_range = [];

  d3.tsv("source/data.tsv", function(error, data) {
    if (error) throw error;

    var parseDate = d3.time.format("%y-%b-%d").parse;
    $.each(data, function(i, d) {
      d.date = parseDate(d.date);
    });

    let range = d3.extent(data, function(d) { return d.date; });
    $scope.max_view_range = {};
    $scope.max_view_range.min = range[0];
    $scope.max_view_range.max = range[1];
    $scope.view_range = {};
    $scope.view_range.min = range[0];
    $scope.view_range.max = range[1];

    $scope.graphs = [
      {
        'title': "TEST",
        'data': $.extend(true, [], data),
        'type': 'stack'
      },
      {
        'title': "TEST2",
        'data': $.extend(true, [], data),
        'type': 'line'
      }
    ];
    $scope.$apply();
  });
});

app.directive('graph', function($timeout, Chart, StackedData, LineData, MouseInteraction) {
  return {
    restrict: 'RE',
    templateUrl: 'partials/graph.html',
    scope: {
      title: '=title',
      data: '=data',
      type: '=type',
      xrange: '=xrange',
      xrangemax: '=xrangemax'
    },
    link: function($scope, $element, $attrs) {
      let data = $scope.data;
      $scope.keys = {};
      $scope.expanded = true;

      $scope.change_x_range = function(x1, x2) {
        $scope.xrange.min = x1;
        $scope.xrange.max = x2;

        $timeout(function() {
          $scope.$apply();
        });
      }

      $scope.reset_x = function() {
        $scope.change_x_range($scope.xrangemax.min, $scope.xrangemax.max);
      };

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
        colour: function(i) {
          return $scope.keys[i].colour;
        }
      };

      var container = d3.select($element[0]).select('#svg_container');

      var draw = function() {
        let chart = new Chart(container, 1035, 500, [ $scope.xrange.min, $scope.xrange.max ], d3.format(".0%"));

        let mapped_entries = entries.domain().map(function(name) {
          return {
            name: name,
            values: $.map(data, function(d) {
              return {date: d.date, y: d[name] / 100};
            }),
            colour: entries.colour(name)
          };
        });

        if ($scope.type == 'stack') {
          let stack = new StackedData(chart, 'browser', mapped_entries);
        }
        else if ($scope.type == 'line') {
          let line = new LineData(chart, 'browser_test', mapped_entries);
        }

        let mouse_interaction = new MouseInteraction(chart, {
          'change_x_range': $scope.change_x_range
        });
      };

      $scope.$watch("keys", draw, true);
      $scope.$watch("xrange", draw, true);
    }
  };
});
