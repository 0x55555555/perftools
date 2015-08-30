
app.factory("ResultRange", function() {
  class ResultRange {
    constructor(min, max) {
      this.range = [ min, max ];
      this.format = ResultRange.defaultFormat;
    }

    defaultFormat(val) {
      return val.toString();
    }

    tickCount(val) {
      return 5;
    }

    set(val) {
      this.range = val;
    }

    setMin(val) {
      this.range[0] = val;
    }

    setMax(val) {
      this.range[1] = val;
    }

    invert() {
      return new ResultRange(this.range[1], this.range[0]);
    }

    safe() {
      return new ResultRange(this.range[0] ? this.range[0] : 0, this.range[1] ? this.range[1] : 0);
    }

    expand(val) {
      if (this.range[0] == null || val < this.range[0]) {
        this.range[0] = val;
      }
      if (this.range[1] == null || val > this.range[1]) {
        this.range[1] = val;
      }
    }
  }

  return ResultRange;
});
