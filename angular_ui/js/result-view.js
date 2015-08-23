var ResultView = function() {
  this._filter = function(set, result) { return true; };
  this._group = function(set, result) {
    //return new Date(result.starts[0] * 1000).getDay()
    return result.starts[0];
  };
  this._set = function(set, result) {
    return set;
  };
  this._sort = function(list) {
    list.sort(function(a, b) {
      return a.x - b.x;
    });
  };
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
    "range": true,
    "minmax": true,
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
      if (!this._filter(r, result)) {
        continue;
      }

      var set = this._set(i, result);
      var results_set = results[set];
      if (results_set == null) {
        results_set = { };
        results[set] = results_set;
      }

      var grp = this._group(r, result);

      if (results.hasOwnProperty(grp)) {
        results_set[grp] = Result.combine(results[grp], result);
      }
      else {
        results_set[grp] = Result.clone(result);
      }
    }
  }

  var result_list = [];
  for (var set_name in results) {
    var set = results[set_name];
    var set_list = [];
    result_list.push({ data: set_list, colour: "#"+((1<<24)*Math.random()|0).toString(16) });
    for (var key in set) {
      var sel = this._select(set[key]);
      set_list.push(sel);

      x_range.expand(sel.x);
      y_range.expand(sel.y_min);
      y_range.expand(sel.y_max);
    }

    this._sort(set_list);
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

  return new ResultViewParams(result_list, x_range, y_range);
}
