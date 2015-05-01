library class_row;

import 'dart:js';
import 'time_values.dart';

class ClassRow
{
  ClassRow(TimeValues this._timeData, int traceCount, DateTime d)
  {
    _row = new List(1 + traceCount * 3);
    _columnCount = 0;
    _row[0] = new JsObject(context['Date'], [d.year, d.month, d.day, d.hour, d.minute, d.second]);
  }
  
  void add(num v, String title, String text)
  {
    num val = v;
    
    int column = 1 + _columnCount * 3;
    _columnCount++;
    
    _row[column] = val;
    _row[column+1] = title;
    _row[column+2] = text;
  }
  
  List get columns => _row;

  TimeValues _timeData;
  List _row;
  int _columnCount;
}