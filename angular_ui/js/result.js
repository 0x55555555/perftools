var Result = function(start, identity, total, total_sq, min, max, count) {
  this.start = start;
  this.machine_identity = identity;
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

Result.clone = function(a) {
  return new Result(
    a.start,
    a.machine_identity,
    a.total,
    a.total_sq,
    a.min,
    a.max,
    a.count
  );
};

Result.combine = function(a, b) {
  var cloned = Result.clone(a);

  this.start = Math.min(cloned.start, b.start);
  this.total += b.total;
  this.total_sq += b.total_sq;
  this.min = Math.min(cloned.min, b.min);
  this.max = Math.max(cloned.max, b.max);
  this.count += b.count;
  
  return cloned;
};
