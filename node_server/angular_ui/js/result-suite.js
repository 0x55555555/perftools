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
