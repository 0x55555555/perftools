
var HoverEffect = function(parent, xScale, yScale, get_x, get_y, format_x, format_y) {
  var group = parent.append("g");

  var x = group.append("line")
    .style({
      "stroke": 'black',
      "stroke-width": 2,
      "fill": "none"
    });

  var y = group.append("line")
    .style({
      "stroke": 'black',
      "stroke-width": 2,
      "fill": "none"
    });

  this.hide = function(d) {
    group.transition()
      .duration(400)
      .ease("linear")
      .attr('opacity', 0.0);
  }

  this.show = function(d) {
    group.transition()
      .duration(400)
      .ease("linear")
      .attr('opacity', 1.0);

    x.transition()
      .duration(100)
      .ease("linear")
        .attr({
          'x1': get_x(d),
          'y1': get_y(d),
          'x2': get_x(d),
          'y2': yScale.range()[1]
        });

    y.transition()
      .duration(100)
      .ease("linear")
        .attr({
          'x1': get_x(d),
          'y1': get_y(d),
          'x2': xScale.range()[0],
          'y2': get_y(d)
        });
  }
}

app.directive("resultChartData", [ "d3Service", function(d3Service) {
  return {
    restrict: "A",
    link: function($scope, $elem, $attrs) {
      d3Service.d3().then(function(d3) {
        var InteractionCloseness = 80;
        var display_data = $scope.display_data;
        var colour = $scope.colour;
        var results = $scope.data;
        var xScale = $scope.x_scale;
        var yScale = $scope.y_scale;

        var current_x = function(d, i) { return xScale(d.x); }
        var current_y = function(d, i) { return yScale(d.y); }
        var current_y_sd_min = function(d) { return yScale(d.y - d.y_sd) }
        var current_y_sd_max = function(d) { return yScale(d.y + d.y_sd) }
        var current_y_min = function(d, i) { return yScale(d.y_min); }
        var current_y_max = function(d, i) { return yScale(d.y_max); }

        var graph = d3.select($elem[0]);

        var hover = new HoverEffect(graph, xScale, yScale, current_x, current_y);

        // Add an area for the sd around the mean.
        if (display_data.range) {
          var area = d3.svg.area()
            .x(current_x)
            .y0(current_y_sd_min)
            .y1(current_y_sd_max);

          graph.append("path")
            .attr({
              'd': area(results),
              'fill-opacity': 0.2,
              'fill': colour
            });
        }

        // Add a line for the mean
        if (display_data.average) {
          var line = d3.svg.line()
            .x(current_x)
            .y(current_y)
            .interpolate("basis");

          graph.append("path")
            .attr({'d': line(results)})
            .style({
              "stroke": colour,
              "stroke-width": 2,
              "fill": "none"
            });
        }

        // Setup members for per point ren
        var data_point = graph
          .selectAll("g")
            .data(results)
              .enter()
                .append("g");

        // Add min and max lines through points
        if (display_data.minmax) {
          data_point.append("line")
            .attr("x1", current_x)
            .attr("y1", current_y_min)
            .attr("x2", current_x)
            .attr("y2", current_y_max)
            .style("stroke", colour)
            .style("stroke-opacity", 0.3)
            .style("stroke-width", 1);
        }

        // add points for means
        if (display_data.average) {
          data_point
            .append("circle")
              .attr("cx", current_x)
              .attr("cy", current_y)
              .attr("r", 5)
              .style("fill", 'white')
              .style("fill-opacity", 0.8)
              .on("mouseover", hover.show)
              .on("mouseout", hover.hide)
          data_point
            .append("circle")
              .attr("cx", current_x)
              .attr("cy", current_y)
              .attr("r", 3)
              .style("fill", colour)
              .on("mouseover", hover.show)
              .on("mouseout", hover.hide);
        }

        var detail = {
          show: function() {
            data_point.attr('opacity', 1.0);
            console.log("show");
          },
          hide: function() {
            data_point.attr('opacity', 0.0);
            console.log("hide");
          }
        }
      });
    }
  }
}]);

app.directive("resultChart", [ "$parse", "$compile", "d3Service", function($parse, $compile, d3Service) {
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


          graphs_selection.exit().remove();
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
          function(s) { return $scope.data(); },
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
}]);
