library chart_data;

import 'dart:js';
import 'class_row.dart';

class ChartData
{
  dynamic get jsData
  {
    if (_jsData == null)
    {
      var output = [ _columns ];
      output.addAll(_rows);
      
      final vis = context["google"]["visualization"];
      _jsData = vis.callMethod('arrayToDataTable', [new JsObject.jsify(output)]);
    }
    return _jsData;
  }
  
  ChartData()
  {
    _rows = [];
  }
  
  void setColumns(List<List<String>> columns)
  {
    _columns = columns;
  }
  
  void addRow(ClassRow row)
  {
    _rows.add(row.columns);
  }

  List<List<String>> _columns;
  List<List> _rows;
  dynamic _jsData;
}