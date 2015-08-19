
var ChartGenerator = function() {
};

ChartGenerator.prototype.generate_graph = function(parent, results, display, xScale, yScale) {

  var last_x = function(d, i) {
    return xScale(results[i-1] ? results[i-1].x : results[i].x);
  }
  var last_y = function(d, i) {
    return yScale(results[i-1] ? results[i-1].y : results[i].y);
  }
  var last_y_min = function(d, i) {
    return yScale(results[i-1] ? results[i-1].y_min : results[i].y_min);
  }
  var last_y_max = function(d, i) {
    return yScale(results[i-1] ? results[i-1].y_max : results[i].y_max);
  }
  var current_x = function(d, i) {
    return xScale(results[i].x);
  }
  var current_y = function(d, i) {
    return yScale(results[i].y);
  }
  var current_y_min = function(d, i) {
    return yScale(results[i].y_min);
  }
  var current_y_max = function(d, i) {
    return yScale(results[i].y_max);
  }

  var graph = parent.append("g");

  if (display.average) {
    var data_point = graph
      .selectAll("circle")
        .data(results)
          .enter();

    data_point.append("line")
      .attr("x1", current_x)
      .attr("y1", current_y)
      .attr("x2", last_x)
      .attr("y2", last_y)
      .style("stroke", "indigo")
      .style("stroke-width", 2);

    data_point.append("circle")
      .attr("cx", current_x)
      .attr("cy", current_y)
      .attr("r", 3)
      .style("fill", "purple");
  }

  if (display.minmax) {
    data_point.append("line")
      .attr("x1", current_x)
      .attr("y1", current_y_min)
      .attr("x2", current_x)
      .attr("y2", current_y_max)
      .style("stroke", "indigo")
      .style("stroke-opacity", 0.3)
      .style("stroke-width", 1);
  }

  if (display.range) {
    poly = [];

    for (var r = 0; r < results.length; ++r) {
      poly.push({ x: xScale(results[r].x), y: yScale(results[r].y + results[r].y_sd) });
    }

    for (var r = results.length-1; r >= 0; --r) {
      poly.push({ x: xScale(results[r].x), y: yScale(results[r].y - results[r].y_sd) });
    }

    graph.selectAll("polygon")
        .data([poly])
      .enter().append("polygon")
        .attr("points",function(d) {
            return d.map(function(d) {
                return [d.x, d.y].join(",");
            }).join(" ");
        })
        .attr('fill-opacity', 0.2)
        .attr("fill","purple")
  }
}

app.directive("resultChart", [ "$parse", "$window", "d3Service", function($parse, $window, d3Service) {
  return {
    restrict: "E",
    link: function(scope, elem, attrs) {
      d3Service.d3().then(function(d3) {

        var padding = 40;
        var xScale, yScale, xAxisGen, yAxisGen;

        var rawSvg = elem[0];
        var svg = d3.select(rawSvg)
          .append("svg")
            .attr("width", 850)
            .attr("height", 400);

        var graphs = svg.append("g");

        var view = new ResultView();

        function redrawLineChart(input_data) {
          graphs.selectAll('*').remove();

          var data = view.processedResults(input_data);

          for (var i in data.results) {
            new ChartGenerator().generate_graph(graphs, data.results[i], data.display, xScale, yScale)
          }

          xScale = d3.scale.linear()
              .domain(data.x.range)
              .range([padding, svg.attr("width") - padding]);

          yScale = d3.scale.linear()
              .domain([data.y.range[1], data.y.range[0]])
              .range([padding, svg.attr("height") - padding]);

          xAxisGen = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(data.y.tickCount())
              .tickFormat(data.x.format);

          yAxisGen = d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .ticks(data.y.tickCount())
              .tickFormat(data.y.format);

          svg.selectAll("g.x.axis").call(xAxisGen);
          svg.selectAll("g.y.axis").call(yAxisGen);
        }

        var exp = $parse(attrs.chartData);
        scope.$watch(exp, function(newVal, oldVal){
          inputData = newVal;
          redrawLineChart(newVal != undefined ? newVal : []);
        }, true);

        var inputData = exp(scope);
        inputData = inputData != undefined ? inputData : [];
        redrawLineChart(inputData != undefined ? inputData : []);

        svg.append("svg:g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (svg.attr("height") - padding) + ")")
          .call(xAxisGen);

        svg.append("svg:g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + padding + ",0)")
          .call(yAxisGen);
      });
    }
  };
}]);
