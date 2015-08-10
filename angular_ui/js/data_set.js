var DataSet = function() {
  this.results = [];
  this._start = null;
  this._end = null;
};

DataSet.prototype.push = function(result) {
  this.results.push(result);

  if (!this._start || result.start < this._start) {
    this._start = result.start;
  }

  if (!this._end || result.start > this._end) {
    this._end = result.start;
  }
};

DataSet.prototype.start = function() {
    return this._start;
};

DataSet.prototype.end = function(result) {
    return this._end;
};
