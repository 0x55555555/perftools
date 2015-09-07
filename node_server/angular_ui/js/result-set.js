app.factory("ResultSet", function(Result, ResultRange, ResultViewParams) {

    let get_date = function(d) {
      return new Date(d * 1000);
    }

    class Formatter {
      constructor(format, count) {
        this.format = format;
        this.tick_count = count;
      }
    }

    let format_date = new Formatter(function(d, range) {
      var date = get_date(d);
      var yyyy = date.getFullYear().toString();
      var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
      var dd  = date.getDate().toString();

      var result = dd + "/" + mm + "/" + yyyy;
      if ((range[1] - range[0]) < 60*60*24*2) {
        result = date.getHours() + ":" + date.getMinutes() + " " + result;
      }

      return result;
    }, 5);

    let format_month = function(d) {
      var date = get_date(d);
      return date.getFullYear() + "/" + date.getMonth();
    };

    let format_week = function(d) {
      var date = get_date(d);
      return Math.floor(date.getDate()/7) + "/" + date.getFullYear();
    };

    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let format_day = function(d) {
      var date = get_date(d);
      return days[date.getDay()];
    }

    class OptionType {
      constructor(name, process) {
        this.name = name;
        this.process = process;
      }
    }

    class GroupType extends OptionType {
      constructor(name, x, process, format) {
        super(name, process);
        this.x = x;
        this.format_group = format;
      }
    }

    let FilterModes = [
      new OptionType("None", function(set, result) { return true; })
    ];

    let GroupModes = [
      new GroupType("Start Second",
        function(entry) {
          return entry.starts[0];
        },
        function(set, result) {
          return result.starts[0]
        },
        format_date
      ),
      new GroupType("Start Week",
        function(entry) {
          return entry.starts[0];
        },
        (set, result) => format_week(result.starts[0]),
        new Formatter(format_week, 10)
      ),
      new GroupType("Start Month",
        function(entry) {
          return entry.starts[0];
        },
        (set, result) => format_month(result.starts[0]),
        new Formatter(format_month, 31)
      ),
      new GroupType("Start Day Of Week",
        function(entry) {
          var date = get_date(entry.starts[0]);
          return date.getDay();
        },
        (set, result) => format_day(result.starts[0]),
        new Formatter((d) => days[d], 7)
      ),
      new GroupType("Start Day Of Month",
        function(entry) {
          var date = get_date(entry.starts[0]);
          return date.getDate();
        },
        (set, result) => get_date(result.starts[0]).getDate(),
        new Formatter((d) => d.toString(), 31)
      )
    ];

    let SetModes = [
      new OptionType("Data Sets", function(set, result) {
        return set;
      }),
      new OptionType("None", function(set, result) {
        return 0;
      })
    ];

    let SortModes = [
      new OptionType("X Increasing", function(list) {
        list.sort(function(a, b) {
          return a.x - b.x;
        });
      }),
    ];

  class ResultSet {
    constructor() {
      this.input = this.results = null;
      this._filter = function(set, result) { return true; };

      this.filters = FilterModes;
      this.groups = GroupModes;
      this.sets = SetModes;
      this.sorts = SortModes;
      this.filter = this.filters[0];
      this.group = this.groups[0];
      this.set = this.sets[0];
      this.sort = this.sorts[0];

      this._select = function(entry) {
        return {
          x: this.group.x(entry),
          y: entry.average(),
          y_sd: entry.sd(),
          y_min: entry.min,
          y_max: entry.max,
          results: entry
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

      for (var i in input.results) {
        var data_set = input.results[i];
        for (var r in data_set.results) {
          var result = data_set.results[r];
          if (!this.filter.process(r, result)) {
            continue;
          }

          var set = this.set.process(i, result);
          var results_set = results[set];
          if (results_set == null) {
            results_set = { };
            results[set] = results_set;
          }

          var grp = this.group.process(r, result);

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

        this.sort.process(set_list);
      }

      x_range.format = this.group.format_group;
      y_range.format = new Formatter((d) => d);

      this.results = new ResultViewParams(result_list, x_range, y_range);
    }
  }

  return ResultSet;
});
