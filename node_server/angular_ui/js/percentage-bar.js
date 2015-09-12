app.directive("percentageBar", function($parse, $compile, d3Service) {
  return {
    restrict: "E",
    scope: {
      title: "&",
      data: "&"
    },
    templateUrl: '/templates/percentage-bar.html',
    link: function($scope, $elem, $attrs) {
    }
  }
});
