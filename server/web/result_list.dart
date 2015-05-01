library result_list;
import 'time_values.dart';
import 'result.dart';
import 'class_row.dart';
import 'chart_data.dart';

class ResultList
{
  ResultList.from(data)
  {
    _timeData = new TimeValues(normalised: true);
    _results = new List.from(data.map((e) => new Result.from(_timeData, e)));
  }
  
  ChartData formatChartDataForTimes(bool perTime, bool perBranch, bool perIdentity)
  {
    if (_results.isEmpty)
    {
      return null;
    }

    List<List<String>> mappedColumns = [['datetime', 'Date']];
    List<List<dynamic>> rows;
    int traceCount = 0;

    if (perTime)
    {
      for (String s in _timeData.timeNames)
      {
        mappedColumns.add(["number", s]);
        mappedColumns.add(["string", "$s title"]);
        mappedColumns.add(["string", "$s text"]);
        ++traceCount;
      }
    }
    else
    {
      mappedColumns.add(["number", 'avg']);
      mappedColumns.add(["string", "avg title"]);
      mappedColumns.add(["string", "avg text"]);
      ++traceCount;
    }

    ChartData chart = new ChartData();
    chart.setColumns(mappedColumns);
    
    for (Result r in _results)
    {
      ClassRow row = new ClassRow(_timeData, traceCount, r.date);
      
      if (perTime)
      {
        int i = 0;
        r.times.forEach((v)
          {
            row.add(v / _timeData.normalisationValue(i),
              _timeData.timeNames[i],
              "${r.description}, ${r.branch}");
            
            ++i;
          }
        );
      }
      else
      {
        int i = 0;
        num sum = 0;
        for (num v in r.times) 
        {
          sum += v / _timeData.normalisationValue(i++);
        }
        num val = sum / r.times.length;
        
        row.add(val,
          r.description,
          r.branch);
      }

      chart.addRow(row);
    }
    
    return chart;
  }
  
  TimeValues _timeData;
  List<Result> _results;
}