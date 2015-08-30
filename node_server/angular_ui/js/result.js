
app.factory("Result", function(utils) {
    class Result {
      constructor(start, identity, total, total_sq, min, max, count) {
        if (start instanceof Array) {
          this.starts = start;
        }
        else {
          this.starts = [ start ];
        }

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
        cloned.total += b.total;
        cloned.total_sq += b.total_sq;
        cloned.min = Math.min(cloned.min, b.min);
        cloned.max = Math.max(cloned.max, b.max);
        cloned.count += b.count;

        return cloned;
      }
    }

    return Result;
});
