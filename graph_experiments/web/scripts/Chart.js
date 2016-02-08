
app.service("Chart", function() {

  return class Chart
  {
    constructor(container, width, height, x_range, y_range, y_format)
    {
      var margin = {top: 20, right: 20, bottom: 30, left: 50};
      this.width = width - margin.left - margin.right,
      this.height = height - margin.top - margin.bottom;

      this.x = d3.time.scale()
          .range([0, this.width]);
      this.x.domain(x_range);

      this.y = d3.scale.linear()
          .range([this.height, 0]);
      this.y.domain(y_range);

      var xAxis = d3.svg.axis()
          .scale(this.x)
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(this.y)
          .orient("left")
          .tickFormat(y_format);

      container.selectAll("*").remove();
      this.root_svg = container.append("svg")
          .attr("width", this.width + margin.left + margin.right)
          .attr("height", this.height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      this.root_svg.append("clipPath")
            .attr("id", "graph-clip")
          .append("rect")
            .attr("x", this.x.range()[0])
            .attr("y", this.y.range()[1])
            .attr("width", this.x.range()[1])
            .attr("height", this.y.range()[0]);

      this.root_svg
        .append("rect")
          .attr("x", this.x.range()[0])
          .attr("y", this.y.range()[1])
          .attr("width", this.x.range()[1])
          .attr("height", this.y.range()[0])
          .style('fill', 'white');

      this.root_svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + this.height + ")")
          .call(xAxis);

      this.root_svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);
    }

    graph_root()
    {
      return this.root_svg;
    }

    add_graph_clip(obj)
    {
      obj.attr("clip-path", "url(#graph-clip)");
    }
  }
});
