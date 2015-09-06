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

        let padding = 5, axis_padding = 20;
        let inputData, xScale, yScale, xAxisGen, yAxisGen;

        var svg = d3.select($elem[0])
          .selectAll("#zoom-svg");

        svg.append("svg:g")
          .attr("class", "x axis");

        var content = svg.append("g");

        function redrawLineChart() {
          var range = inputData.x.range;
          if (!$scope.data().results || !isFinite(range[0]) || !isFinite(range[1])) {
            return;
          }

          let width = svg.node().getBoundingClientRect().width;
          let height = 75;

          content.selectAll('*').remove();

          xScale = d3.scale.linear()
              .domain(range)
              .range([padding, width - padding]);

          yScale = d3.scale.linear()
              .domain(inputData.y.invert().range)
              .range([padding, height - axis_padding]);

          xAxisGen = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks($scope.data().results.x.format.tick_count)
              .tickFormat((d) => $scope.data().results.x.format.format(d, xScale.domain()));

          svg.selectAll("g.x.axis")
            .call(xAxisGen)
            .attr("transform", "translate(0," + (height - axis_padding) + ")");;

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

          var selector_height = height - 6;

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
              .attr("height", selector_height);

          $scope.range.set(xScale.domain());
        }

        $scope.$watch(
          function() { return $scope.data() ? $scope.data() : null; },
          function(newVal, oldVal) {
            inputData = newVal.results;
            redrawLineChart(newVal.x ? newVal.x.range : undefined);
          },
          true
        );

        window.addEventListener('resize', redrawLineChart);
      });

    }
  };
});
