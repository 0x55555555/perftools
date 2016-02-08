
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
      yformat: '=yformat',
    },
    link: function($scope, $element, _$attrs) {
      let data = $scope.data;
      $scope.keys = {};
      $scope.expanded = false;

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

      const colour = d3.scale.category20c();
      const keys = Object.keys(data[0]).slice(1);
      for (let i in keys) {
        $scope.keys[keys[i]] = {
          show: true,
          colour: colour(i),
        };
      }

      const entries = {
        domain: function() {
          return d3.keys($scope.keys).filter(function(key) { return $scope.keys[key].show === true; });
        },
        colour: function(i) {
          return $scope.keys[i].colour;
        },
      };

      const container = d3.select($element[0]).select('#svg_container');

      const draw = function() {
        let format = d3.format($scope.yformat)

        let mapped_entries = entries.domain().map(function(name) {
          return {
            name: name,
            values: $.map(data, function(d) {
              return {date: d.date, y: d[name] / 100};
            }),
            colour: entries.colour(name),
          };
        });

        let chart = new Chart(container, 1035, 500, [ $scope.xrange.min, $scope.xrange.max ], format);

        if ($scope.type == 'stack') {
          chart.add_object(new StackedData('browser', mapped_entries));
        }
        else if ($scope.type == 'line') {
          chart.add_object(new LineData('browser_test', mapped_entries));
        }

        chart.add_object(new MouseInteraction({
          change_x_range: $scope.change_x_range,
        }));
        chart.build();
      };

      $scope.$watch("keys", draw, true);
      $scope.$watch("xrange", draw, true);
    },
  };
});
