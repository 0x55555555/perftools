
app.directive('selector', function($location) {
  return {
    restrict: 'RE',
    templateUrl: 'partials/SelectorDirective.html',
    scope: {
      sessions: '=sessions',
      currentsession: '=currentsession',
      shouldhide: '=shouldhide',
    },
    link: function($scope)
    {
      $scope.set_session = function(session_id)
      {
        $location.url('/' + session_id);
      };
    },
  }
});
