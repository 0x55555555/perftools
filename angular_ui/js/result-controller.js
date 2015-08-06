var ServerUrl = 'http://localhost:3000/';

app.controller('ResultController', function($scope, $http) {
  $scope.data_sets = { };

  var add_data_set = function(path, start, data) {
    var parent = $scope.data_sets;
    for (var i = 0; i < path.length; ++i) {
      var name = path[i];
      if (!(name in parent)) {
        parent[name] = { };
      }

      if (i == path.length-1) {
        parent[start] = data;
      }

      parent = parent[name];
    }
  }

  var get_result = function(result) {
    $http({
      method: 'JSONP',
      url: ServerUrl + 'result?id=' + result.id + '&callback=JSON_CALLBACK'
    }).success(function(data, status) {
      for (var ctx_name in data.contexts) {
        var ctx = data.contexts[ctx_name];

        var parents = {};
        for (var res in ctx.results) {
          var results = ctx.results[res];
          parents[results.name] = results.parent;
        }

        var parentLists = {};
        for (var res in parents) {
          var path = [];
          parentLists[res] = path;
          var obj = res;
          while(obj = parents[obj]) {
            path.push(obj);
          }
          path.push(res);
        }

        for (var res in ctx.results) {
          var results = ctx.results[res];
          var path = [ data.recipe, ctx_name ].concat(parentLists[results.name]);

          if (results.total_time) {
            add_data_set(path.concat("offset"), ctx.start, new Result(
              results.total_time,
              results.total_time_sq,
              results.min_time,
              results.max_time,
              results.fire_count
            ));
          }

          if (results.total_offset_time) {
            add_data_set(path.concat("offset"), ctx.start, new Result(
              results.total_offset_time,
              results.total_offset_time_sq,
              results.min_offset_time,
              results.max_offset_time,
              results.fire_count
            ));
          }
        }
      }
      result.value = 4;
    }).error(function(data, status) {
      console.log("Error getting result summary info", data, status);
    });
  }

  var get_results = function(key, key_data) {
    $http({
      method: 'JSONP',
      url: ServerUrl + 'result_summary?recipe=' + key_data._id + '&callback=JSON_CALLBACK'
    }).success(function(data, status) {
      key_data.results = [];
      for (var i in data) {
        var result = {
           date: data[i].start,
           value: 0,
           id: data[i]._id
        };
        key_data.results.push(result);
        get_result(result);
      }
    }).error(function(data, status) {
      console.log("Error getting result summary info", data, status);
    });
  };

  var get_summary = function() {
    $http({
      method: 'JSONP',
      url: ServerUrl + 'summary?callback=JSON_CALLBACK'
    }).success(function(data, status) {
      for (var i in data) {
        data[i].results = [
          { date: data[i].first, value: 0 },
          { date: data[i].last, value: 0 },
        ];
        get_results(i, data[i]);
      }
      $scope.results = data;
    }).error(function(data, status) {
      console.log("Error getting summary info", data, status);
    });
  };

  get_summary();
});