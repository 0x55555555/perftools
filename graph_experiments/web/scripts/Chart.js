
app.service("Chart", function() {

  return class Chart
  {
    constructor(container, width, height, x_range, y_range, y_format)
    {
      this.objects = [];
      this.container = container;
      this.width = width;
      this.height = height;
      this.x_range = x_range;
      this.y_range = [Infinity, -Infinity];
      this.y_format = y_format;
    }

    graph_root()
    {
      return this.root_svg;
    }

    add_graph_clip(obj)
    {
      obj.attr("clip-path", "url(#graph-clip)");
    }

    add_object(object)
    {
      this.objects.push(object);
      const extents = object.y_range();
      this.y_range[0] = Math.min(extents[0], this.y_range[0]);
      this.y_range[1] = Math.max(extents[1], this.y_range[1]);
    }

    build()
    {
      const margin = {top: 20, right: 20, bottom: 30, left: 50};
      this.graph_width = this.width - margin.left - margin.right,
      this.graph_height = this.height - margin.top - margin.bottom;

      this.x = d3.time.scale()
          .range([0, this.graph_width]);
      this.x.domain(this.x_range);

      this.y = d3.scale.linear()
          .range([this.graph_height, 0]);
      this.y.domain(this.y_range);

      const xAxis = d3.svg.axis()
          .scale(this.x)
          .orient("bottom");

      const yAxis = d3.svg.axis()
          .scale(this.y)
          .orient("left")
          .tickFormat(this.y_format);

      this.container.selectAll("*").remove();
      this.root_svg = this.container.append("svg")
          .attr("width", this.graph_width + margin.left + margin.right)
          .attr("height", this.graph_height + margin.top + margin.bottom)
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
          .attr("transform", "translate(0," + this.graph_height + ")")
          .call(xAxis);

      this.root_svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

      // Now build all child objects into this
      this.objects.forEach((obj) => obj.build(this));
    }
  }
});
