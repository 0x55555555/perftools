app.directive("percentageBar", function($parse, $compile, d3Service) {
  return {
    restrict: "E",
    scope: {
      data: "&"
    },
    templateUrl: '/templates/percentage-bar.html',
    link: function($scope, $elem, $attrs) {
      let root = d3.select($elem[0]).select("svg");

      $scope.$watch(
        (s) => {
          return s.data();
        },
        (data_map, _) => {
          let data = [ ];
          let total_count = 0;
          for (var key in data_map) {
            data.push({
              name: key,
              count: data_map[key],
              prior_count_sum: total_count,
            });
            total_count += data_map[key];
          }

          root.selectAll('g').remove();
          let grps = root.selectAll("g")
            .data(data)
              .enter()
                .append("g");

          let to_percent = function(names) {
            return (d) => (100 * d[names] / total_count);
          }
          let prior_sum = to_percent("prior_count_sum");
          let count = to_percent("count");

          let rect = grps.append("rect")
            .attr("x", (d) => prior_sum(d) + "%")
            .attr("y", "0%")
            .attr("width", (d) => count(d) + "%")
            .attr("height", "100%")
            .attr("fill", "#"+((1<<24)*Math.random()|0).toString(16));

          grps.append("text")
            .attr("x", (d) => {
              return prior_sum(d) + (count(d) * 0.5) + "%"
            })
            .attr("y", "13px")
            .text((d) => d.name)
            .classed("percentage-item", true);
        },
        true
      );
    }
  }
});
