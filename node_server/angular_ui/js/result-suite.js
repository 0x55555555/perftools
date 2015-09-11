app.directive("resultSuite", function($parse, $compile, ResultRange, ResultSet) {
  return {
    restrict: "E",
    scope: {
      data: "="
    },
    templateUrl: '/templates/result-suite.html',
    link: function($scope, $elem, $attrs) {

      $elem.addClass("result-suite");
      let results = $elem.find("#results");

      $scope.range = new ResultRange();
      $scope.view = new ResultSet(0, 0);

      let show_details = function(d) {
        if ($scope.details != d) {
          $scope.details = d;
          setTimeout(() => $scope.$broadcast('layout-graph'), 5);
        }
        if (d != null) {
          results.addClass("result-chart-minimised");
        }
        else {
          results.removeClass("result-chart-minimised");
        }
      }

      $scope.show_details = function(x) {
        show_details(x);
        $scope.$digest();
      }

      $scope.$on('close-details', () => show_details(null))

      $scope.$watch(
        function() { return $scope.data ? $scope.data : null; },
        function(newVal, oldVal) {
          $scope.view.process($scope.data);
          if ($scope.view.x) {
            $scope.range.set($scope.view.x.range);
          }
        },
        true
      );
    }
  }
});
