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

app.controller('mainController', function($scope, Chart, StackedData, LineData, MouseInteraction) {
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
        colour: function(i) {
          return $scope.keys[i].colour;
        }
      };

      var container = d3.select("body").select('#graph').select('#svg_container');

      var draw = function() {
        let chart = new Chart(container, 1035, 500, $scope.x_range, d3.format(".0%"));

        let mapped_entries = entries.domain().map(function(name) {
          return {
            name: name,
            values: data.map(function(d) {
              return {date: d.date, y: d[name] / 100};
            }),
            colour: entries.colour(name)
          };
        });

        let stack = new StackedData(chart, 'browser', mapped_entries);
        let line = new LineData(chart, 'browser_test', mapped_entries);
        let mouse_interaction = new MouseInteraction(chart, {
          change_x_range: function(x1, x2) {
            $scope.x_range = [x1, x2];
            $scope.$apply();
          }
        });
      };

      $scope.$watch("keys", draw, true);
      $scope.$watch("x_range", draw, true);
      $scope.$apply();
    });
});
