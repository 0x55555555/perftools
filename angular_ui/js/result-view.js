var ResultView = function() {
  this._filter = function() { return true; };
  this._group = function(result) { return result.starts[0]};
  this._sort = function() { };
  this._select = function(entry) {
    return {
      x: entry.starts[0],
      y: entry.average(),
      y_sd: entry.sd(),
      y_min: entry.min,
      y_max: entry.max
    }
  };
};

var ResultRange = function() {
  this.range = [ null, null ];
  this.format = ResultRange.defaultFormat;
};

ResultRange.prototype.defaultFormat = function(val) {
  return val.toString();
}

ResultRange.prototype.tickCount = function(val) {
  return 5;
}

ResultRange.prototype.expand = function(val) {
  if (this.range[0] === null || val < this.range[0]) {
    this.range[0] = val;
  }
  if (this.range[1] === null || val > this.range[1]) {
    this.range[1] = val;
  }
}

var ResultViewParams = function(results, x_range, y_range) {
  this.results = results;
  this.x = x_range;
  this.y = y_range;
  this.display = {
    "average": true,
  };
};

ResultView.prototype.processedResults = function(input) {
  var x_range = new ResultRange();
  var y_range = new ResultRange();

  var results = { };
  for (var i in input.results) {
    var data_set = input.results[i];
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

      for (var i in result.starts) {
        x_range.expand(result.starts[i]);
      }
    }
  }

  var result_list = [];
  for (var key in results) {
    result_list.push(results[key]);
  }

  this._sort(result_list);

  for (var key in result_list) {
    result_list[key] = this._select(result_list[key]);
  }

  x_range.format = function(d) {
    var date = new Date(d * 1000);
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = date.getDate().toString();

    var result = dd + "/" + mm + "/" + yyyy;
    if ((x_range.range[1] - x_range.range[0]) < 60*60*24*2) {
      result = date.getHours() + ":" + date.getMinutes() + " " + result;
    }

    return result;
  };

  y_range.expand(0);
  y_range.expand(100);

  return new ResultViewParams(result_list, x_range, y_range);
}
