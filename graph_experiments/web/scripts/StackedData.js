
app.service("StackedData", function() {

  return class StackedData
  {
    constructor(chart, id, entries)
    {
      let stack = d3.layout.stack()
          .values(function(d) { return d.values; });

      let stacked_data = stack(entries);

      let area = d3.svg.area()
          .x(function(d) { return chart.x(d.date); })
          .y0(function(d) { return chart.y(d.y0); })
          .y1(function(d) { return chart.y(d.y0 + d.y); });

      let browser = chart.graph_root().selectAll("." + id)
          .data(stacked_data)
        .enter().append("g")
          .attr("class", id);

      let path = browser.append("path")
          .attr("class", "area")
          .attr("d", function(d) { return area(d.values); })
          .style("fill", function(d) { return d.colour; });
      chart.add_graph_clip(path);

      browser.append("text")
          .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + chart.x(d.value.date) + "," + chart.y(d.value.y0 + d.value.y / 2) + ")"; })
          .attr("x", -6)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });

    }
  }
});
