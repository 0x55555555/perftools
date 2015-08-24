var Results = function() {
  this.input = this.results = null;
  this._filter = function(set, result) { return true; };
  this._group = function(set, result) {
    //return new Date(result.starts[0] * 1000).getDay()
    return result.starts[0];
  };

  for(this.set in Results.SetModes) break;
  this.sets = Results.SetModes;

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

Results.SetModes = {
  'data_sets': function(set, result) {
    return set;
  },
  'none': function(set, result) {
    return 0;
  }
};

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

Results.prototype.reprocess = function(input) {
  this.process(this.input);
}

Results.prototype.process = function(input) {
  this.input = input;
  var x_range = new ResultRange();
  var y_range = new ResultRange();

  var results = { };

  var set_fn = this.sets[this.set];

  for (var i in input.results) {
    var data_set = input.results[i];
    for (var r in data_set.results) {
      var result = data_set.results[r];
      if (!this._filter(r, result)) {
        continue;
      }

      var set = set_fn(i, result);
      var results_set = results[set];
      if (results_set == null) {
        results_set = { };
        results[set] = results_set;
      }

      var grp = this._group(r, result);

      if (results_set.hasOwnProperty(grp)) {
        results_set[grp] = Result.combine(results_set[grp], result);
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

  this.results = new ResultViewParams(result_list, x_range, y_range);
}
