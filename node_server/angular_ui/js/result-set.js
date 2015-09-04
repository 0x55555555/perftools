app.factory("ResultSet", function(Result, ResultRange, ResultViewParams) {

    class GroupType {
      constructor(find_group) {
        this.find_group = find_group;
      }
    }

    let FilterModes = {
      'none': function(set, result) { return true; }
    };

    let GroupModes = {
      'start_second': new GroupType((set, result) => {
          return result.starts[0]
        }
      ),
      'start_week': new GroupType((set, result) => {
          var date = new Date(result.starts[0] * 1000);
          return date.getFullYear() + "_" + Math.floor(date.getDate()/7);
        }
      ),
      'start_month': new GroupType((set, result) => {
          var date = new Date(result.starts[0] * 1000);
          return date.getFullYear() + "_" + date.getMonth();
        }
      ),
      'start_dow': new GroupType((set, result) => {
          return new Date(result.starts[0] * 1000).getDay()
        }
      ),
      'start_dom': new GroupType((set, result) => {
          return new Date(result.starts[0] * 1000).getDate()
        }
      )
    };

    let SetModes = {
      'data_sets': function(set, result) {
        return set;
      },
      'none': function(set, result) {
        return 0;
      }
    };

    let SortModes = {
      'x_increasing': function(list) {
        list.sort(function(a, b) {
          return a.x - b.x;
        });
      },
    };

  class ResultSet {
    constructor() {
      this.input = this.results = null;
      this._filter = function(set, result) { return true; };

      this.filters = FilterModes;
      for(this.filter in this.filters) break;

      this.groups = GroupModes;
      for(this.group in this.groups) break;

      this.sets = SetModes;
      for(this.set in this.sets) break;

      this.sorts = SortModes;
      for(this.sort in this.sorts) break;

      this._select = function(entry) {
        return {
          x: entry.starts[0],
          y: entry.average(),
          y_sd: entry.sd(),
          y_min: entry.min,
          y_max: entry.max
        }
      };
    }

    reprocess(input) {
      this.process(this.input);
    }

    process(input) {
      this.input = input;
      var x_range = new ResultRange();
      var y_range = new ResultRange();

      var results = { };

      var set_fn = this.sets[this.set];
      var sort_fn = this.sorts[this.sort];
      var filter_fn = this.filters[this.filter];
      var group = this.groups[this.group];

      for (var i in input.results) {
        var data_set = input.results[i];
        for (var r in data_set.results) {
          var result = data_set.results[r];
          if (!filter_fn(r, result)) {
            continue;
          }

          var set = set_fn(i, result);
          var results_set = results[set];
          if (results_set == null) {
            results_set = { };
            results[set] = results_set;
          }

          var grp = group.find_group(r, result);

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

        sort_fn(set_list);
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
  }

  return ResultSet;
});
