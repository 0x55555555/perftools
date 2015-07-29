
require 'test/unit'
require_relative 'TestUtils'
require_relative '../../bindings/ruby/lib/perf.rb'
require 'json'


class TestCPP < Test::Unit::TestCase
  def setup
  end

  def teardown
  end

  def test_identity
    cfg = Perf::Config.new()

    ctx = Perf::Context.new(cfg, "idenity")
    assert ctx != nil

    id = cfg.identity
    assert_not_nil id
    assert_kind_of String, id.to_s

    obj = JSON.parse(id.to_s)
    assert_not_nil obj

    assert_equal 9, obj.length
    assert_kind_of String, obj["cpu"]
    assert_kind_of Fixnum, obj["cpu_speed"]
    assert_kind_of Fixnum, obj["cpu_count"]
    assert_kind_of Fixnum, obj["thread_count"]
    assert_kind_of Fixnum, obj["memory_bytes"]
    assert_kind_of String, obj["binding"]
    assert_kind_of String, obj["os"]
    assert_kind_of String, obj["arch"]
    assert_kind_of String, obj["extra"]
  end

  def test_block(ctx, num)
    test = ""
    ctx.block("test_block_#{num}") do
      num.times do
        test += "*"
      end
    end
  end

  def test_timing
    cfg = Perf::Config.new()
    ctx = Perf::Context.new(cfg, "timing_test")

    test_block(ctx, 10)
    test_block(ctx, 100)
    test_block(ctx, 1000)
    test_block(ctx, 10000)

    obj = JSON.parse(ctx.dump)
    assert_not_nil obj

    ctx.write("test/data/ruby.json")
  end

  def test_contextCollection
    open_perf_server "context_collection" do |port|
      pkg = Perf::Package.new("master", "af4343c", "testing some bits", "test/*.json", nil, "ruby-cpp-test")

      obj = pkg.to_s
      assert_not_nil JSON.parse(obj)

      pkg.submit("http://localhost:#{port}/submit")
    end
  end
end
