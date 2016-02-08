
app.service("MouseInteraction", function() {

  return class MouseInteraction
  {
    constructor(observer)
    {
      this.observer = observer;
    }

    y_range()
    {
      return [Infinity, -Infinity];
    }

    build(chart)
    {
      const line = chart.root_svg.append("line")
        .attr("class", "pointer_location")
        .attr('y1', chart.y.range()[0])
        .attr('y2', chart.y.range()[1]);
      chart.add_graph_clip(line);

      const selection = chart.root_svg.append("rect")
        .attr("class", "pointer_selection")
        .attr("stroke", "black")
        .attr('y', chart.y.range()[1])
        .attr('height', chart.y.range()[0] - chart.y.range()[1]);
      chart.add_graph_clip(selection);

      function select(x1, x2) {
        if (!x1) {
          selection.attr("display", "none");
          return;
        }

        selection.attr('x', Math.min(x1, x2));
        selection.attr('width', Math.abs(x2 - x1));
        selection.attr("display", "");
      }
      select(null, null);

      let select_origin = null;

      chart.root_svg.on('mouseleave', function() {
        line.attr("display", "none");
      });

      chart.root_svg.on('mousemove', function () {
         const x = d3.mouse(this)[0];
         line.attr("stroke-width", 2);
         line.attr('x1', x);
         line.attr('x2', x);
         line.attr("display", "");

         if (select_origin) {
           select(select_origin, x);
         }
      });

      chart.root_svg.on('mousedown', function() {
         const x = d3.mouse(this)[0];
         select_origin = x;
      });

      let that = this;
      chart.root_svg.on('mouseup', function() {
        select();
        const select_end = d3.mouse(this)[0];
        if (select_origin != select_end) {
          that.observer.change_x_range(chart.x.invert(select_origin), chart.x.invert(select_end));
        }
        select_origin = 0;
      });
    }
  }
});
