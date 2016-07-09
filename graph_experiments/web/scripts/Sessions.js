
class Graph
{
  constructor(graph)
  {
    this._graph = graph;
    this._rows = this._graph.data.map((e) =>
    {
      e.date = new Date(e.date);
      return e;
    });
  }

  get title()
  {
    return this._graph.title;
  }

  get type()
  {
    return this._graph.type;
  }

  get yformat()
  {
    return this._graph.yformat;
  }

  get rows()
  {
    return this._rows;
  }
}

class Session
{
  constructor(data)
  {
    this._data = data;
    this._graphs = this._data.graphs.map((e) => {
      return new Graph(e)
    });
  }

  get title()
  {
    return this._data.title;
  }

  get source()
  {
    return this._data.source;
  }

  get graphs()
  {
    return this._graphs;
  }
}

app.factory('sessions', function($http) {
  return {
    sessions: function() {
      return $http({
        method: 'GET',
        url: '/sessions'
      }).then(function successCallback(response) {
        let out = {};
        response.data.sessions.forEach((e) =>
        {
          out[e.name] = e;
        });
        return out;
      }, function errorCallback(_) {
        return {};
      });
    },

    session: function(name) {
      return $http({
        method: 'GET',
        url: `/session/${name}`
      }).then(function successCallback(response) {
        return new Session(response.data);
      }, function errorCallback(_) {
        return {};
      });
    }
  };
});
