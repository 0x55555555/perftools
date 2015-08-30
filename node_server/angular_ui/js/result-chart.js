app.directive("resultChart", function($parse, $compile, d3Service) {
  return {
    restrict: "E",
    scope: {
       data: "&",
       range: "&"
    },
    link: function($scope, $elem, $attrs) {
      d3Service.d3().then(function(d3) {

        var padding = 40;
        var xScale, yScale, xAxisGen, yAxisGen, inputData, xRange;

        var root = $elem[0];
        var svg = d3.select(root)
          .append("svg")
            .attr("width", 850)
            .attr("height", 400);

        var clip = svg.append("defs")
          .append("clipPath")
          .attr("id","graphClip")
          .append("rect");

        var graphs = svg.append("g");
        var refreshClip = function() {
          var x = xScale.range();
          var y = yScale.range();
          clip
            .attr("x", x[0])
            .attr("y", y[0])
            .attr("width", x[1]-x[0])
            .attr("height", y[1]-y[0]);

          graphs.attr("clip-path","url(#graphClip)");
        }


        function redrawLineChart() {
          if (!xRange || !inputData) {
            return;
          }

          graphs.selectAll('*').remove();

          var graphs_selection = graphs.selectAll("svg")
            .data(inputData.results);

          var range = xRange.safe().range;

          xScale = d3.scale.linear()
              .domain(xRange.safe().range)
              .range([padding, svg.attr("width") - padding]);

          yScale = d3.scale.linear()
              .domain(inputData.y.invert().range)
              .range([padding, svg.attr("height") - padding]);
          refreshClip();


          graphs_selection
            .enter()
              .append("g")
              .select(function(d, i) {
                this.appendChild($compile("<svg data-result-chart-data></svg>")({
                  data: d.data,
                  display_data: inputData.display,
                  x_scale: xScale,
                  y_scale: yScale,
                  colour: d.colour
                })[0]);
              });

          xAxisGen = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(inputData.y.tickCount())
              .tickFormat(inputData.x.format);

          yAxisGen = d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .ticks(inputData.y.tickCount())
              .tickFormat(inputData.y.format);

          svg.selectAll("g.x.axis").call(xAxisGen);
          svg.selectAll("g.y.axis").call(yAxisGen);
        }

        $scope.$watch(
          function(s) { return $scope.data() ? $scope.data().results : null; },
          function(newVal, oldVal){
            inputData = newVal;
            redrawLineChart();
          },
          true
        );

        $scope.$watch(
          function(s) { return s.range() },
          function(newVal, oldVal) {
            xRange = newVal;
            redrawLineChart();
          },
          true
        );

        svg.append("svg:g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (svg.attr("height") - padding) + ")");

        svg.append("svg:g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + padding + ",0)");
      });
    }
  };
});
