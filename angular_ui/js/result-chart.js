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

          var min = [];
          var max = [];

          for (var d in data) {
            min.push(data[d].start());
            max.push(data[d].end());
          }
          min = d3.min(min);
          max = d3.min(max);

          xScale = d3.scale.linear()
              .domain([min, max])
              .range([padding, svg.attr("width") - padding]);

          yScale = d3.scale.linear()
              .domain([50, 0])
              .range([padding, svg.attr("height") - padding]);

          var format_date = function(d) {
            var date = new Date(d * 1000);
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
            var dd  = date.getDate().toString();

            var result = dd + "/" + mm + "/" + yyyy;
            if ((max - min) < 60*60*24*2) {
              result = date.getHours() + ":" + date.getMinutes() + " " + result;
            }

            return result;
          };

          xAxisGen = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(5)
              .tickFormat(format_date);

          yAxisGen = d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .ticks(5);
        }

        function process_data(data) {
          var output = [];
          for (var i in data) {
            var result = {
              date: data[i].start,
              value: data[i].average()
            };

            if (i == 0) {
              result.last_date = data[i].start,
              result.last_value = 0
            }
            else {
              result.last_date = data[i-1].start,
              result.last_value = data[i-1].average()
            }

            output.push(result);
          }

          return output;
        }

        function redrawLineChart(input_data) {
          lines.selectAll('*').remove();

          var data = view.processedResults(input_data);

          var value_array = [];
          for (var val in data) {
            value_array.push(data[val]);
          }

          var data_point = lines.selectAll("circle")
            .data(value_array)
              .enter()
                .append("g")
                  .selectAll("circle")
                    .data(function(d) { return process_data(d.results); })
                      .enter();

          data_point.append("line")
            .attr("x1", function(d, i) { return xScale(d.date); })
            .attr("y1", function(d, i) { return yScale(d.value); })
            .attr("x2", function(d, i) { return xScale(d.last_date); })
            .attr("y2", function(d, i) { return yScale(d.last_value); })
            .style("stroke", "indigo")
            .style("stroke-width", 2);
          data_point.append("circle")
            .attr("cx", function(d, i) { return xScale(d.date); })
            .attr("cy", function(d, i) { return yScale(d.value); })
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
        setChartParameters(inputData);
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
