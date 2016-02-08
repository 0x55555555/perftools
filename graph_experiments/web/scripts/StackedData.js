
app.service("StackedData", function() {

  return class StackedData
  {
    constructor(id, entries)
    {
      this.id = id;
      this.entries = entries;

      let stack = d3.layout.stack()
          .values(function(d) { return d.values; });
      this.stack = stack(this.entries);
    }

    y_range()
    {
      let max = d3.max(this.entries, d => {
        return d3.max(d.values, val => val.y + val.y0);
      });

      let min = d3.min(this.entries, d => {
        return d3.min(d.values, val => val.y0);
      });
      return [min, max];
    }

    build(chart)
    {

      let area = d3.svg.area()
          .x(function(d) { return chart.x(d.date); })
          .y0(function(d) { return chart.y(d.y0); })
          .y1(function(d) { return chart.y(d.y0 + d.y); });

      let stacked_g = chart.graph_root().selectAll("." + this.id)
          .data(this.stack)
        .enter().append("g")
          .attr("class", this.id);

      let path = stacked_g.append("path")
          .attr("class", "area")
          .attr("d", function(d) { return area(d.values); })
          .style("fill", function(d) { return d.colour; });
      chart.add_graph_clip(path);

      stacked_g.append("text")
          .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + chart.x(d.value.date) + "," + chart.y(d.value.y0 + d.value.y / 2) + ")"; })
          .attr("class", "line_label")
          .attr("x", -6)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });

    }
  }
});
