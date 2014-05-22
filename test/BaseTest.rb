
require 'test/unit'

def runProcess(process, debug=false)
  output = `#{process}`

  if (debug)
    puts output
  end
  
  if (!$?.success? || $?.exitstatus != 0)
    raise output
  end
end

runProcess(File.dirname(__FILE__) + "/../core/build.sh")

require_relative '../bindings/ruby/lib/perf.rb'
require 'json'

class TestExpose < Test::Unit::TestCase
  def setup
  end

  def teardown
  end

  def test_identity
    cfg = Perf::Config.new()

    ctx = Perf::Context.new(cfg, "idenity")
    assert_equal :no_error, ctx.error

    id = cfg.identity
    assert_not_nil id
    assert_kind_of String, id.to_s

    obj = JSON.parse(id.to_s)
    assert_not_nil obj

    assert_equal 6, obj.length
    assert_kind_of String, obj["cpu"]
    assert_kind_of String, obj["cpuCount"]
    assert_kind_of String, obj["memoryBytes"]
    assert_kind_of String, obj["binding"]
    assert_kind_of String, obj["os"]
    assert_kind_of String, obj["osDetail"]
  end

  def test_timing
    cfg = Perf::Config.new()
    ctx = Perf::Context.new(cfg, "timing_test")

    test = ""

    ctx.block("test_block_10") do
      10.times do 
        test += "*"
      end
    end

    ctx.block("test_block_100") do
      100.times do 
        test += "*"
      end
    end

    ctx.block("test_block_1000") do
      1000.times do 
        test += "*"
      end
    end

    ctx.block("test_block_10000") do
      10000.times do 
        test += "*"
      end
    end

    obj = JSON.parse(ctx.dump)
    assert_not_nil obj

    ctx.write("test/ruby.json")
  end

  def test_cppBinding
    runProcess(File.dirname(__FILE__) + "/cppTest/build.sh")
  end

  def test_contextCollection
    recipe = %{
void cook(final ProcessorInput p, ProcessorResult r)
{
  Set<String> beginMatches = p.selectCaptures(new RegExp(r'::(.*)::begin$')).toSet();
  Set<String> endMatches = p.selectCaptures(new RegExp(r'::(.*)::end$')).toSet();
  
  Set<String> ranges = beginMatches.intersection(endMatches);
  
  ranges.forEach((e)
    {
      Map<String, int> times = { };
      p.select(new RegExp("$e::(.*)\\$"), (match, time)
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
}}
    pkg = Perf::Package.new("dev/TheGoodStuff", "af4343c", "testing some bits", "test/sampleExport/*.json", recipe)

    obj = pkg.to_s
    assert_not_nil JSON.parse(obj)

    pkg.submit('http://localhost:14663/submit')
  end
end

