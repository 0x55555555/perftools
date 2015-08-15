var ResultView = function() {
};

ResultView.prototype.processedResults = function(input) {
  for (var i in input) {
    var data_set = input[i];
    for (var r in data_set.results) {
      var result = data_set.results[r];
      console.log(result.machine_identity.extra);
    }
  }
  return input;
}
