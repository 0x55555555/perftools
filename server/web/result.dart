library result;
import 'time_values.dart';

class Result
{
  Result.from(TimeValues timeNames, Map<String, dynamic> resultData)
  {
    _date = DateTime.parse(resultData['time']);
    Map<String, dynamic> times = resultData['data'];

    _branch = resultData['branch'];
    _description = resultData['description'];

    _times = new List();
    times.forEach((k, v)
      {
        v.forEach((n, t)
          {
          int index = timeNames.indexFor("$k::$n");
          if (index <= _times.length)
          {
            _times.length = index+1;
          }
          _times[index] = t;
          timeNames.addValue(index, t);
          }
        );
      }
    );
  }

  DateTime get date => _date;
  List<num> get times => _times;
  String get description => _description;
  String get branch => _branch;
  
  DateTime _date;
  List<num> _times;
  String _branch;
  String _description;
}
