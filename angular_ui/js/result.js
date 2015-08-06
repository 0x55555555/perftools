var Result = function(total, total_sq, min, max, count) {
  this.total = total;
  this.total_sq = total_sq;
  this.min = min;
  this.max = max;
  this.count = count;
};

Result.prototype.average = function() {
    return this.total / this.count;
};

Result.prototype.sd = function() {
    var mean_sq = this.total_sq / this.count;
    var mean = this.average();
    return Math.sqrt(mean_sq - mean * mean);
};
