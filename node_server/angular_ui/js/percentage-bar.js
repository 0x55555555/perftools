app.directive("percentageBar", function($parse, $compile, d3Service) {
  return {
    restrict: "E",
    scope: {
      data: "&"
    },
    link: function($scope, $elem, $attrs) {
      let root = d3.select($elem[0]);

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

          root.selectAll('div').remove();
          let grps = root.selectAll("div")
            .data(data)
              .enter();

          let to_percent = function(names) {
            return (d) => (100 * d[names] / total_count);
          }
          let prior_sum = to_percent("prior_count_sum");
          let count = to_percent("count");

          let random_num = () => Math.floor(Math.random() * 255) + 1;
          let random_colour = () => {
            return "rgba("
              + random_num() + ","
              + random_num() + ","
              + random_num() + ","
              + "0.5)";
          };

          grps.append("div")
            .attr("class", "percentage-item")
            .style("left", (d) => prior_sum(d) + "%")
            .style("width", (d) => count(d) + "%")
            .style("background-color", (d) => {
              return random_colour();
            })
            .text((d) => d.name);
        },
        true
      );
    }
  }
});
