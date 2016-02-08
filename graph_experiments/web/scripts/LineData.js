
app.service("LineData", function() {

  return class LineData
  {
    constructor(chart, id, entries)
    {
      let area = d3.svg.line()
          .x(function(d) { return chart.x(d.date); })
          .y(function(d) { return chart.y(d.y); })

      let browser = chart.graph_root().selectAll("." + id)
          .data(entries)
        .enter().append("g")
          .attr("class", id);

      let path = browser.append("path")
          .attr("class", "area")
          .attr("d", function(d) { return area(d.values); })
          .style("stroke", function(d) { return d.colour; })
          .style("stroke-width", 2)
          .style('fill', 'transparent');
      chart.add_graph_clip(path);

      /*browser.append("text")
          .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + chart.x(d.value.date) + "," + chart.y(d.value.y0 + d.value.y / 2) + ")"; })
          .attr("x", -6)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });*/

    }
  }
});
