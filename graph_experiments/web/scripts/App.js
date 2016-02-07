/* jshint -W097 */
"use strict";

var app = angular.module("graphexp", [
  'ngRoute',
  'ngAnimate'
]);

app.controller("mainController", function($scope) {
  $scope.graphs = [];
  $scope.view_range = [];
  $scope.data_source = "Generated on XXX";
  $scope.title = "Graphs!";

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
        'type': 'stack',
        'yformat': '%'
      },
      {
        'title': "TEST2",
        'data': $.extend(true, [], data),
        'type': 'line',
        'yformat': ".2f"
      }
    ];
    $scope.$apply();
  });
});
