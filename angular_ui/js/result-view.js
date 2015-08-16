var ResultView = function() {
  this._filter = function() { return true; };
  this._group = function(result) { return result.start};
  this._sort = function() { };
};

var ResultRange = function() {
  this[0] = null;
  this[1] = null;
};


var ResultViewParams = function(results) {
  this.results = results;
};

ResultView.prototype.processedResults = function(input) {
  var results = { };
  for (var i in input) {
    var data_set = input[i];
    for (var r in data_set.results) {
      var result = data_set.results[r];
      if (!this._filter(result)) {
        continue;
      }

      var grp = this._group(result);

      if (results.hasOwnProperty(grp)) {
        results[grp] = Result.combine(results[grp], result);
      }
      else {
        results[grp] = Result.clone(result);
      }
      console.log(result.machine_identity.extra);
    }
  }

  var result_list = [];
  for (var key in results) {
    result_list.push(results[key]);
  }

  var x_range = new ResultRange();
  var y_range = new ResultRange();
  this._sort(result_list);

  return new ResultViewParams(result_list, x_range, y_range);
}
