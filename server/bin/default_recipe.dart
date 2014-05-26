import 'result_processor.dart';

class TheCooker extends Cooker 
{
  
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

    if (p.recipeDescription != null)
    {
      _name = p.recipeDescription;
    }
    else
    {
      _name = r.hashTimeNames();
    }
  }
  
  String get name => _name;
  
  String _name;
}

void main(args, replyTo) => Processor.start(args, replyTo, new TheCooker());