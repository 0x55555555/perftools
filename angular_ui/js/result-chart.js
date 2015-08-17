app.directive("resultChart", [ "$parse", "$window", "d3Service", function($parse, $window, d3Service) {
  return {
    restrict: "E",
    link: function(scope, elem, attrs) {
      d3Service.d3().then(function(d3) {

        var padding = 20;
        var xScale, yScale, xAxisGen, yAxisGen;

        var rawSvg = elem[0];
        var svg = d3.select(rawSvg)
          .append("svg")
            .attr("width", 850)
            .attr("height", 200);

        var lines = svg.append("g");

        var view = new ResultView();

        function setChartParameters(data) {

          xScale = d3.scale.linear()
              .domain(data.x.range)
              .range([padding, svg.attr("width") - padding]);

          yScale = d3.scale.linear()
              .domain([data.y.range[1], data.y.range[0]])
              .range([padding, svg.attr("height") - padding]);

          xAxisGen = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(5)
              .tickFormat(data.x.format);

          yAxisGen = d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .ticks(5)
              .tickFormat(data.y.format);
        }

        function redrawLineChart(input_data) {
          lines.selectAll('*').remove();

          var data = view.processedResults(input_data);
          var results = data.results;

          var data_point = lines
            .selectAll("circle")
              .data(results)
                .enter();

          data_point.append("line")
            .attr("x1", function(d, i) {
              return xScale(results[i].starts[0]); })
            .attr("y1", function(d, i) {
              return yScale(results[i].average()); })
            .attr("x2", function(d, i) {
              return xScale(results[i-1] ? results[i-1].starts[0] : results[i].starts[0]); })
            .attr("y2", function(d, i) {
              return yScale(results[i-1] ? results[i-1].average() : results[i].average()); })
            .style("stroke", "indigo")
            .style("stroke-width", 2);
          data_point.append("circle")
            .attr("cx", function(d, i) {
              return xScale(d.starts[0]); })
            .attr("cy", function(d, i) {
              return yScale(d.average()); })
            .attr("r", 3)
            .style("fill", "purple");

          setChartParameters(data);
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
