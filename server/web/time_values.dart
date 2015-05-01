library time_values;

class TimeValues
{
  TimeValues({ bool normalised: false })
  {
    _normalised = normalised;
  }
  get timeNames => _timeNames;
  
  int indexFor(String str)
  {
    int id = _times[str];
    if (id == null)
    {
      id = _max++;
      _times[str] = id;
      _timeNames.add(str);

      _totals.add(0);
      _counts.add(0);
      assert(_totals.length == _max);
      assert(_counts.length == _max);
    }
    
    return id;
  }
  
  num normalisationValue(int id)
  {
    return _totals[id]/_counts[id];
  }
  
  void addValue(int id, num value)
  {
    ++_counts[id];
    _totals[id] += value;
  }
  
  Map<String, int> _times = { };
  List<String> _timeNames = [];
  int _max = 0;
  List<num> _totals = [];
  List<int> _counts = [];
  
  bool _normalised;
}