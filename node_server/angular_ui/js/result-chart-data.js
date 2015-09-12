

app.directive("resultChartData", function(d3Service, HoverEffect) {
  return {
    restrict: "A",
    link: function($scope, $elem, $attrs) {
      d3Service.d3().then(function(d3) {
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

        let graph = d3.select($elem[0]);
        let hover = new HoverEffect(graph, xScale, yScale, current_x, current_y);
        let select = $scope.onSelect;

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
              "stroke-width": display_data.simple ? 1 : 2,
              "fill": "none"
            });
        }

        // Setup members for per point rendering
        var data_point = graph
          .selectAll("g").filter(".graph_point")
            .data(results)
              .enter()
                .append("g");
        data_point.attr("class", "graph_point");

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
        if (display_data.average && !display_data.simple) {
          data_point
            .append("circle")
              .attr("cx", current_x)
              .attr("cy", current_y)
              .attr("r", 5)
              .style("fill", 'white')
              .style("fill-opacity", 0.8)
              .on("mouseover", (d) => { hover.show(d) })
              .on("mouseout", (d) => { hover.hide(d) })
              .on("mouseup", select);
          data_point
            .append("circle")
              .attr("cx", current_x)
              .attr("cy", current_y)
              .attr("r", 3)
              .style("fill", colour)
              .on("mouseover", (d) => { hover.show(d) })
              .on("mouseout", (d) => { hover.hide(d) })
              .on("mouseup", select);
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
});
