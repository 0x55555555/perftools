var DragHandle = function(parent, data) {

  var dragright = d3.behavior.drag()
      .origin(Object)
      .on("drag", rdragresize);

  var sync = function() {
    dragbarright.attr("x", function(d) { return data.value - data.width/2; });
    dragbarright.attr("width", function(d) { return data.width; });
  };

  this.sync = sync;

  function rdragresize(d) {
    var min = data.min();
    var max = data.max();
    data.value = Math.max(min, Math.min(max, data.value + d3.event.dx));
    sync();
    data.changed();
  }

  var dragbarright = parent.append("rect")
        .attr("x", function(d) { return data.value - data.width/2; })
        .attr("y", function(d) { return 10; })
        .attr("id", "dragright")
        .attr("height", 30)
        .attr("width", data.width)
        .attr("fill", "gray")
        .attr("stroke", "black")
        .attr("stroke-width", 1.0)
        .attr("cursor", "ew-resize")
        .call(dragright);
}

app.directive("zoomChart", [ "$parse", "$compile", "d3Service", function($parse, $compile, d3Service) {
  return {
    restrict: "E",
    scope: {
       data: "&",
       range: "="
    },
    link: function($scope, $elem, $attrs) {
      d3Service.d3().then(function(d3) {

        var padding = 40;
        var xScale, yScale, xAxisGen, yAxisGen;

        var root = $elem[0];
        var svg = d3.select(root)
          .append("svg")
            .attr("width", 850)
            .attr("height", 50);

        var selectors = svg.append("g");

        var view = new ResultView();

        function redrawLineChart(range) {
          if (!$scope.data()) {
            return;
          }
          
          selectors.selectAll('*').remove();

          xScale = d3.scale.linear()
              .domain(range)
              .range([padding, svg.attr("width") - padding]);

          xAxisGen = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(5)
              .tickFormat($scope.data().x.format);

          svg.selectAll("g.x.axis").call(xAxisGen);

          var min = xScale.range()[0];
          var max = xScale.range()[1];
          var current_min = {
            value: min,
            width: 7
          };
          var current_max = {
            value: max,
            width: 7
          };
          var centre = {
            min: function() { return min; },
            max: function() { return max; }
          };

          current_min.min = function() { return min; }
          current_min.max = function() { return current_max.value - current_max.width; }
          current_max.min = function() { return current_min.value + current_min.width; }
          current_max.max = function() { return max; }

          var update_centre = function() {
            centre.value = (current_max.value+current_min.value) / 2;
            centre.width = (current_max.value-current_min.value) - current_min.width;
          }
          update_centre();

          var update_scope = function(apply) {
            $scope.range.setMin(xScale.invert(current_min.value));
            $scope.range.setMax(xScale.invert(current_max.value));
            if(apply) { $scope.$apply(); }
          }
          update_scope(false);

          current_min.changed = current_max.changed = function() {
            update_centre();
            centre_handle.sync();
            update_scope(true);
          }

          centre.changed = function() {
            current_min.value = centre.value - centre.width / 2;
            current_max.value = centre.value + centre.width / 2;
            min_handle.sync();
            max_handle.sync();
            update_scope(true);
          }

          var centre_handle = new DragHandle(selectors, centre);
          var min_handle = new DragHandle(selectors, current_min);
          var max_handle = new DragHandle(selectors, current_max);
        }

        $scope.$watch(
          function() { 
            var data = $scope.data();
            return data ? data.x.range : [0, 0];
          },
          function(newVal, oldVal) {
            inputData = newVal;
            redrawLineChart(newVal != undefined ? newVal : []);
          },
          true
        );

        svg.append("svg:g")
          .attr("class", "x axis")
          .attr("transform", "translate(0,25)");
      });
    }
  };
}]);
