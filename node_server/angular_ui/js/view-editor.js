

app.directive("viewEditor", [ "d3Service", function(d3Service) {
  return {
    restrict: "E",
    scope: {
       view: "="
    },
    templateUrl: '/templates/view-editor.html',
    link: function($scope, $elem, $attrs) {
      $scope.reprocess = function() {
        $scope.view.reprocess();
      }
    }
  };
}]);
