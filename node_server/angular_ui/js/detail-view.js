app.directive("detailView", function($parse, $compile, ResultRange, ResultSet) {
  return {
    restrict: "E",
    scope: {
      data: "="
    },
    templateUrl: '/templates/detail-view.html',
    link: function($scope, $elem, $attrs) {
    }
  }
});
