app.factory("HoverEffect", function() {
  class HoverEffect {
    constructor(parent, xScale, yScale, get_x, get_y, format_x, format_y) {
      var group = parent.append("g");

      var x = group.append("line")
        .style({
          "stroke": 'black',
          "stroke-width": 2,
          "fill": "none"
        });

      var y = group.append("line")
        .style({
          "stroke": 'black',
          "stroke-width": 2,
          "fill": "none"
        });
    }

    hide(d) {
      group.transition()
        .duration(400)
        .ease("linear")
        .attr('opacity', 0.0);
    }

    show(d) {
      group.transition()
        .duration(400)
        .ease("linear")
        .attr('opacity', 1.0);

      x.transition()
        .duration(100)
        .ease("linear")
          .attr({
            'x1': get_x(d),
            'y1': get_y(d),
            'x2': get_x(d),
            'y2': yScale.range()[1]
          });

      y.transition()
        .duration(100)
        .ease("linear")
          .attr({
            'x1': get_x(d),
            'y1': get_y(d),
            'x2': xScale.range()[0],
            'y2': get_y(d)
          });
    }
  }

  return HoverEffect;
});
