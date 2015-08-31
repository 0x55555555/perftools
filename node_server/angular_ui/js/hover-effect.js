app.factory("HoverEffect", function() {
  class HoverEffect {
    constructor(parent, xScale, yScale, get_x, get_y, format_x, format_y) {
      this.get_x = get_x;
      this.get_y = get_y;
      this.xScale = xScale;
      this.yScale = yScale;
      this.group = parent.append("g");

      this.x = this.group.append("line")
        .style({
          "stroke": 'black',
          "stroke-width": 2,
          "fill": "none"
        });

      this.y = this.group.append("line")
        .style({
          "stroke": 'black',
          "stroke-width": 2,
          "fill": "none"
        });
    }

    hide(d) {
      this.group.transition()
        .duration(200)
        .ease("linear")
        .attr('opacity', 0.0);
    }

    show(d) {
      this.group.transition()
        .duration(200)
        .ease("linear")
        .attr('opacity', 1.0);

      this.x.transition()
        .duration(50)
        .ease("linear")
          .attr({
            'x1': this.get_x(d),
            'y1': this.get_y(d),
            'x2': this.get_x(d),
            'y2': this.yScale.range()[1]
          });

      this.y.transition()
        .duration(50)
        .ease("linear")
          .attr({
            'x1': this.get_x(d),
            'y1': this.get_y(d),
            'x2': this.xScale.range()[0],
            'y2': this.get_y(d)
          });
    }
  }

  return HoverEffect;
});
