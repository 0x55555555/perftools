
app.factory("DataSet", function() {

  class DataSet {
    constructor() {
      this.results = [];
      this._start = null;
      this._end = null;
    }

    push(result) {
      this.results.push(result);

      if (!this._start || result.start < this._start) {
        this._start = result.start;
      }

      if (!this._end || result.start > this._end) {
        this._end = result.start;
      }
    }

    start() {
      return this._start;
    }

    end(result) {
      return this._end;
    }
  }

  return DataSet;
});
