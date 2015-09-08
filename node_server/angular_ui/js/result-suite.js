app.directive("resultSuite", function($parse, $compile, ResultRange, ResultSet) {
  return {
    restrict: "E",
    scope: {
      data: "="
    },
    templateUrl: '/templates/result-suite.html',
    link: function($scope, $elem, $attrs) {

      $elem.addClass("result-suite")

      $scope.range = new ResultRange();
      $scope.view = new ResultSet(0, 0);
      $scope.show_details = false;

      let show_details = function(d) {
        if ($scope.show_details != d) {
          $scope.show_details = d;
          setTimeout(() => $scope.$broadcast('layout-graph'), 5);
        }
      }

      $scope.someCallback = function(x) {
        show_details(true);
        $scope.$apply();
      }

      $scope.$on('close-details', () => show_details(false))

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
