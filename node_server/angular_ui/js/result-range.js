
app.factory("ResultRange", function() {
  var ResultRange = function(min, max) {
    this.range = [ min, max ];
    this.format = ResultRange.defaultFormat;
  };

  ResultRange.prototype.defaultFormat = function(val) {
    return val.toString();
  }

  ResultRange.prototype.tickCount = function(val) {
    return 5;
  }

  ResultRange.prototype.setMin = function(val) {
    this.range[0] = val;
  }

  ResultRange.prototype.setMax = function(val) {
    this.range[1] = val;
  }

  ResultRange.prototype.invert = function() {
    return new ResultRange(this.range[1], this.range[0]);
  }

  ResultRange.prototype.safe = function() {
    return new ResultRange(this.range[0] ? this.range[0] : 0, this.range[1] ? this.range[1] : 0);
  }

  ResultRange.prototype.expand = function(val) {
    if (this.range[0] == null || val < this.range[0]) {
      this.range[0] = val;
    }
    if (this.range[1] == null || val > this.range[1]) {
      this.range[1] = val;
    }
  }
  
  return ResultRange;
});
