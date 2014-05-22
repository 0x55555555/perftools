import 'dart:isolate';
import 'dart:convert';
import 'result_processor.dart';

class TheRecipe extends Recipe {

void cook(final ProcessorInput p, ProcessorResult r)
{
  Set<String> beginMatches = p.selectCaptures(new RegExp(r'::(.*)::begin$')).toSet();
  Set<String> endMatches = p.selectCaptures(new RegExp(r'::(.*)::end$')).toSet();
  
  Set<String> ranges = beginMatches.intersection(endMatches);
  
  ranges.forEach((e)
    {
      Map<String, int> times = { };
      p.select(new RegExp("$e::(.*)\$"), (match, time)
        {
        times[match.group(1)] = time;
        }
      );
      
      int begin = times["begin"];
      
      Map<String, int> diffs = { };
      times.forEach((k, v)
        {
          if (k == "begin")
          {
            return;
          }
          
          diffs["begin -> $k"] = v - begin;
        }
      );
      
      r.addTimes(e, diffs);
    }
  );
}

}

void main(List<String> args, SendPort replyTo) 
{
  new Processor().process(JSON.decode(args[0]), new TheRecipe()).then((val)
    {
      replyTo.send(val);
    }
  );
}
