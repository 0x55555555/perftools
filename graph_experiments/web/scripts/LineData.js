
app.service("LineData", function() {
  "use strict";

  return class LineData
  {
    constructor(id, entries)
    {
      this.id = id;
      this.entries = entries;
    }

    y_range()
    {
      let max = d3.max(this.entries, d => {
        return d3.max(d.values, val => val.y);
      });

      let min = d3.min(this.entries, d => {
        return d3.min(d.values, val => val.y);
      });
      return [ min, max ];
    }

    build(chart)
    {
      let area = d3.svg.line()
          .x(function(d) { return chart.x(d.date); })
          .y(function(d) { return chart.y(d.y); })

      let line_g = chart.graph_root().selectAll("." + this.id)
          .data(this.entries)
        .enter().append("g")
          .attr("class", this.id);

      let path = line_g.append("path")
          .attr("class", "area")
          .attr("d", function(d) { return area(d.values); })
          .style("stroke", function(d) { return d.colour; })
          .style("stroke-width", 2)
          .style('fill', 'transparent');
      chart.add_graph_clip(path);

      line_g.append("text")
          .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + chart.x(d.value.date) + "," + chart.y(d.value.y) + 15 + ")"; })
          .attr("class", "line_label")
          .attr("x", -6)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });
    }
  }
});
