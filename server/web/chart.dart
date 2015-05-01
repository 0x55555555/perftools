library chart;
import 'chart_data.dart';
import 'dart:async';
import 'dart:html';
import 'dart:js';

class Chart
{
  var jsOptions;
  var jsChart;
  
  Chart(Element element, String title, Map options)
  {
    final vis = context["google"]["visualization"];
    jsChart = new JsObject(vis["AnnotationChart"], [element]);
    jsOptions = new JsObject.jsify(options);
  }
  
  void draw(ChartData d)
  {
    jsChart.callMethod('draw', [d.jsData, jsOptions]);
    jsChart.callMethod('setVisibleChartRange', [null, null]);
  }
  
  static Future load()
  {
    Completer c = new Completer();
    context["google"].callMethod('load',
       ['visualization', '1', new JsObject.jsify({
         'packages': ['annotationchart'],
         'callback': new JsFunction.withThis(c.complete)
       })]);
    return c.future;
  }
}