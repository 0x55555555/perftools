
app.factory("ResultViewParams", function(utils) {
  class ResultViewParams {
    constructor(results, x_range, y_range) {
      this.results = results;
      this.x = x_range;
      this.y = y_range;
      this.display = {
        "average": true,
        "range": true,
        "minmax": true,
      };
    }
  }

  return ResultViewParams;
});
