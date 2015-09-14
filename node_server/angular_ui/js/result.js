
app.factory("Result", function(utils) {
    let to_array = function(i) {
        if (i instanceof Array) {
          return i;
        }
        else {
          return [ i ];
        }
    }

    class Result {
      constructor(
          start,
          identity,
          recipe_data,
          vcs,
          total,
          total_sq,
          min,
          max,
          count)
      {
        this.starts = to_array(start);
        this.vcs = to_array(vcs);
        this.recipes = to_array(recipe_data);

        if (identity instanceof Array) {
          this.machine_identities = identity;
        }
        else {
          this.machine_identities = [ identity ];
        }
        this.total = total;
        this.total_sq = total_sq;
        this.min = min;
        this.max = max;
        this.count = count;
        this.combined_count = 1;
      }

      average() {
        return this.total / this.count;
      }

      sd() {
        var mean_sq = this.total_sq / this.count;
        var mean = this.average();
        return Math.sqrt(mean_sq - mean * mean);
      }

      static clone(a) {
        return new Result(
          utils.clone_array(a.starts),
          utils.clone_array(a.machine_identities),
          utils.clone_array(a.recipes),
          utils.clone_array(a.vcs),
          a.total,
          a.total_sq,
          a.min,
          a.max,
          a.count
        );
      }

      static combine(a, b) {
        var cloned = Result.clone(a);

        cloned.starts = cloned.starts.concat(b.starts);
        cloned.machine_identities = cloned.machine_identities.concat(b.machine_identities);
        cloned.recipes = cloned.recipes.concat(b.recipes);
        cloned.vcs = cloned.vcs.concat(b.vcs);
        cloned.total += b.total;
        cloned.total_sq += b.total_sq;
        cloned.min = Math.min(cloned.min, b.min);
        cloned.max = Math.max(cloned.max, b.max);
        cloned.count += b.count;
        cloned.combined_count = a.combined_count + b.combined_count;

        return cloned;
      }
    }

    return Result;
});
