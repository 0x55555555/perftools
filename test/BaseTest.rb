
require 'test/unit'
require_relative '../bindings/ruby/lib/perf.rb'
require 'json'

def open_perf_db(port)
  to_kill = []
  to_root = ""
  data_dir = "#{to_root}test/data_#{port}"
  FileUtils.mkdir_p(data_dir)
  sleep(1)
  to_kill << IO.popen("mongod --dbpath #{data_dir}").pid
  to_kill << IO.popen("node #{to_root}node_server/server.js").pid

  # Wait for servers to start
  sleep(2)

  yield

ensure
  to_kill.each do |pid|
    Process.kill "TERM", pid
    Process.wait pid
  end
  FileUtils.rm_rf(data_dir)
end

class TestExpose < Test::Unit::TestCase
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

    ctx.write("test/data/ruby.json")
  end

  def test_contextCollection
    open_perf_db(3000) do
      pkg = Perf::Package.new("master", "af4343c", "testing some bits", "test/*.json", nil, "ruby-cpp-test")

      obj = pkg.to_s
      assert_not_nil JSON.parse(obj)

      pkg.submit('http://localhost:3000/submit')
    end
  end
end
