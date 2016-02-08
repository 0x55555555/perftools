
app.directive('graph', function($timeout, Chart, StackedData, LineData, MouseInteraction) {
  return {
    restrict: 'RE',
    templateUrl: 'partials/GraphDirective.html',
    scope: {
      title: '=title',
      data: '=data',
      type: '=type',
      xrange: '=xrange',
      xrangemax: '=xrangemax',
      yformat: '=yformat'
    },
    link: function($scope, $element, $attrs) {
      let data = $scope.data;
      $scope.keys = {};
      $scope.expanded = true;

      $scope.change_x_range = function(x1, x2) {
        $scope.xrange.min = x1;
        $scope.xrange.max = x2;

        $timeout(function() {
          $scope.$apply();
        });
      }

      $scope.reset_x = function() {
        $scope.change_x_range($scope.xrangemax.min, $scope.xrangemax.max);
      };

      var colour = d3.scale.category20c();
      var keys = Object.keys(data[0]).slice(1);
      for (let i in keys) {
        $scope.keys[keys[i]] = {
          show: true,
          colour: colour(i)
        };
      }

      var entries = {
        domain: function() {
          return d3.keys($scope.keys).filter(function(key) { return $scope.keys[key].show === true; });
        },
        colour: function(i) {
          return $scope.keys[i].colour;
        }
      };

      var container = d3.select($element[0]).select('#svg_container');

      var draw = function() {
        let format = d3.format($scope.yformat)

        let mapped_entries = entries.domain().map(function(name) {
          return {
            name: name,
            values: $.map(data, function(d) {
              return {date: d.date, y: d[name] / 100};
            }),
            colour: entries.colour(name)
          };
        });

        let y_range = [0, 1];
        let chart = new Chart(container, 1035, 500, [ $scope.xrange.min, $scope.xrange.max ], y_range, format);

        if ($scope.type == 'stack') {
          let stack = new StackedData(chart, 'browser', mapped_entries);
        }
        else if ($scope.type == 'line') {
          let line = new LineData(chart, 'browser_test', mapped_entries);
        }

        let mouse_interaction = new MouseInteraction(chart, {
          'change_x_range': $scope.change_x_range
        });
      };

      $scope.$watch("keys", draw, true);
      $scope.$watch("xrange", draw, true);
    }
  };
});
