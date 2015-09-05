app.directive("zoomChart", function($parse, $compile, d3Service) {
  return {
    restrict: "E",
    scope: {
       data: "&",
       range: "="
    },
    templateUrl: '/templates/zoom-chart.html',
    link: function($scope, $elem, $attrs) {
      d3Service.d3().then(function(d3) {

        var padding = 5, axis_padding = 20;
        var inputData, xScale, yScale, xAxisGen, yAxisGen;

        var svg = d3.select($elem[0])
          .selectAll("svg");

        svg.append("svg:g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (svg.attr('height') - axis_padding) + ")");

        var content = svg.append("g");

        function redrawLineChart() {
          var range = inputData.x.range;
          if (!$scope.data().results || !range[0] || !range[1]) {
            return;
          }


          content.selectAll('*').remove();

          xScale = d3.scale.linear()
              .domain(range)
              .range([padding, svg.attr("width") - padding]);

          yScale = d3.scale.linear()
              .domain(inputData.y.invert().range)
              .range([padding, svg.attr("height") - axis_padding]);

          xAxisGen = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks($scope.data().results.x.format.tick_count)
              .tickFormat((d) => $scope.data().results.x.format.format(d, xScale.domain()));

          svg.selectAll("g.x.axis").call(xAxisGen);

          content
            .selectAll("svg")
            .data(inputData.results)
              .enter()
                .append("g")
                .select(function(d, i) {
                  this.appendChild($compile("<svg data-result-chart-data></svg>")({
                    data: d.data,
                    display_data: { "average": true, "simple": true },
                    x_scale: xScale,
                    y_scale: yScale,
                    colour: d.colour,
                    onSelect: () => { }
                  })[0]);
                });

          var height = svg.attr('height') - 4;

          var brush = d3.svg.brush()
              .x(xScale)
              .extent(xScale.domain())
              .on("brush", () => {
                $scope.range.set(brush.extent());
                $scope.$apply();
              });

          var brushg = content.append("g")
            .attr("class", "window")
            .attr("transform", "translate(0," + padding + ")")
            .call(brush);

          brushg.selectAll("rect")
              .attr("height", height);

          $scope.range.set(brush.extent());
        }

        $scope.$watch(
          function() { return $scope.data() ? $scope.data() : null; },
          function(newVal, oldVal) {
            inputData = newVal.results;
            redrawLineChart(newVal.x ? newVal.x.range : undefined);
          },
          true
        );
      });
    }
  };
});