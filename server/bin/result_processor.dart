library perf_result_processor;
import 'dart:core';
import 'dart:convert';
import 'dart:async';
import 'dart:isolate';

abstract class Cooker
{
  void cook(final ProcessorInput p, ProcessorResult r);
}

class ProcessorResult
{
  ProcessorResult(data)
  {
    _times = { };
    _output = {
      "times": _times,
      "branch": data['branch'],
      "description": data['description'],
      "identity": data['identity'] 
    };
  }
    
  void addTimes(String title, Map<String, int> times)
  {
    _times[title] = times; 
  }
  
  String toJson()
  {
    JsonEncoder e = new JsonEncoder.withIndent('  ');
    return e.convert(_output);
  }

  var _output;
  var _times;
}

class ProcessorInput
{
  ProcessorInput(this._data);
  
  void select(RegExp r, void func(match, time))
  {
    _data.keys.forEach((e)
      {
        Match m = r.firstMatch(e);
        if (m != null)
        {
          func(m, _data[e]);
        }
      }
    );
  }
  
  Iterable<String> selectCaptures(RegExp r)
  {
    List<String> out = [];
    select(r, (m, t)
      {
        out.add(m.group(1));
      }
    );
    
    return out;
  }

  var _data;
}

class Processor
{
  static void start(List<String> args, SendPort replyTo, Cooker r)
  {
    new Processor().process(JSON.decode(args[0]), r).then((val)
      {
        replyTo.send(val);
      }
    );
  }
  
  Future<ProcessorResult> process(data, Cooker r)
  {
    Map pkg = { };
    _setupPackage(pkg, data);
    ProcessorInput input = new ProcessorInput(pkg);
    
    ProcessorResult output = new ProcessorResult(data);
    Completer c = new Completer();
    r.cook(input, output);
    
    c.complete(output);
    
    return c.future;
  }
  
  
  _setupPackage(Map out, Map data)
  {
    Map contexts = data['contexts'];
    contexts.forEach((k, v)
    {
      _setupContext(out, "::$k", v);
    });
  }
  
  _setupContext(Map out, var prefix, var context)
  {
    var results = context['results'];
    var start = _processAbsoluteTime(context['start']);
    
    for (var result in results)
    {
      _setupResult(out, prefix, start, result);
    }
  }
  
  _setupResult(Map out, var prefix, var start, var result)
  {
    String name = result['name'];
    var time = _processRelativeTime(start, result['time']);
    
    out["$prefix::$name"] = time;
  }

  _processAbsoluteTime(var absTime)
  {
    int secs = absTime[0];
    int nsecs = absTime[1];
    return secs * 1000000 + nsecs;
  }

  _processRelativeTime(var absTime, var relTime)
  {
    return absTime + relTime;
  }
}
