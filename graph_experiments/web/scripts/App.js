/* jshint -W097 */
"use strict";

const app = angular.module("graphexp", [
  'ngRoute',
  'ngAnimate',
]);

app.controller("mainController", function($scope, $rootScope, $location, $timeout) {
  $scope.graphs = [];
  $scope.view_range = [];

  d3.tsv("source/data.tsv", function(error, data) {
    if (error) throw error;

    let parseDate = d3.time.format("%y-%b-%d").parse;
    $.each(data, function(i, d) {
      d.date = parseDate(d.date);
    });

    let reset_view_range = function()
    {
      let range = d3.extent(data, function(d) { return d.date; });
      $scope.max_view_range = {};
      $scope.max_view_range.min = range[0];
      $scope.max_view_range.max = range[1];
      $scope.view_range = {};
      $scope.view_range.min = range[0];
      $scope.view_range.max = range[1];
    }

    $scope.sessions = {
      a: {
        title: 'session-a',
        source: "XXX",
        graphs: [
          {
            title: "TEST4",
            data: $.extend(true, [], data),
            type: 'stack',
            yformat: '%',
          },
          {
            title: "TEST5",
            data: $.extend(true, [], data),
            type: 'line',
            yformat: ".2f",
          },
        ],
      },
      b: {
        title: 'session-b',
        source: "YYY",
        graphs: [
          {
            title: "TEST1",
            data: $.extend(true, [], data),
            type: 'stack',
            yformat: '%',
          },
          {
            title: "TEST0",
            data: $.extend(true, [], data),
            type: 'line',
            yformat: ".2f",
          },
        ],
      },
      c: {
        title: 'session-c',
        source: "ZZZ",
        graphs: [
          {
            title: "TEST1",
            data: $.extend(true, [], data),
            type: 'stack',
            yformat: '%',
          },
          {
            title: "TEST8",
            data: $.extend(true, [], data),
            type: 'line',
            yformat: ".2f",
          },
        ],
      },
    };
    $scope.session = $scope.sessions[$location.path().slice(1)];
    $scope.selector_hidden = true;

    $rootScope.$on('$locationChangeSuccess', function () {
      $scope.session = $scope.sessions[$location.path().slice(1)];
      $scope.selector_hidden = true;

      reset_view_range();

      $timeout(function() {
        $scope.$apply();
      });
    });
  });
});
