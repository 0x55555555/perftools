app.directive("detailView", function($parse, $compile, ResultRange, ResultSet, d3Service) {
  return {
    restrict: "E",
    scope: {
      data: "&",
    },
    templateUrl: '/templates/detail-view.html',
    link: function($scope, $elem, $attrs) {
      d3Service.d3().then(function(d3) {
        let format_date = function(d) {
          let date = new Date(d * 1000);
          return date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        }

        $scope.start = function() {
          if (!$scope.data()) {
            return null;
          }

          return format_date(d3.min($scope.data().starts));
        }

        $scope.end = function() {
          if (!$scope.data()) {
            return null;
          }

          return format_date(d3.max($scope.data().starts));
        }

        $scope.date_range = function() {
          let s = $scope.start();
          let e = $scope.end();

          if (s == e) {
            return "on " + s;
          }

          return "between " + s + " - " + e;
        }

        $scope.identity_data = function() {
          return {};
        }
      });

      $scope.identity_data = { };
      $scope.$watch(
        function(s) { return !$scope.data() ? {} : $scope.data().machine_identities },
        function(newVal, oldVal) {
          $scope.identity_data = { };

          for (let r_idx in newVal) {
            let result = newVal[r_idx];
            for (let t_key in result) {
              let group = null;
              if ($scope.identity_data[t_key] == undefined) {
                group = { };
                $scope.identity_data[t_key] = group;
              }
              else {
                group = $scope.identity_data[t_key];
              }

              let value = result[t_key];
              if (group[value] == undefined) {
                group[value] = 1;
              }
              else {
                ++group[value];
              }
            }
          }
        },
        true
      );
    }
  }
});
