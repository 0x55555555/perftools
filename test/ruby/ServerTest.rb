require 'test/unit'
require_relative 'TestUtils'
require_relative '../../bindings/ruby/lib/perf.rb'
require 'json'


PRNG = Random.new(1234)

def make_identity()
  return {
    "arch" => [
      "x86_64",
      "x86",
      "arm"
    ].sample,
    "os" => [
      "Darwin 13.4.0",
      "Darwin 14.4.0",
      "Windows 6.1",
      "Windows 6.2",
      "linux 2.7",
      "linux 3.2" ].sample,
    "cpu" => [
      "Intel Core i7-4960HQ CPU @ 2.60GHz",
      "Intel Core i5-3210M @ 2.50GHz",
      "Intel Core i7-4710HQ @ 2.50GHz",
      "Intel Xeon E5-2690 v2 @ 3.00GHz",
      "AMD FX-9370 Eight-Core",
      "AMD FX-6300 Six-Core"
    ].sample,
    "cpu_count" => [ 1, 2, 4, 8, 32 ].sample,
    "thread_count" => [ 1, 2, 4, 8, 32, 64 ].sample,
    "cpu_speed" => [ 1.2, 2.2, 2.6, 3.3, 3.5, 4.0].sample.to_i * 1000000000,
    "extra" => [ "", "MacBookPro11,3", "netbook", "virtualbox" ].sample,
    "memory_bytes" => [ 2, 4, 8, 16, 32, 128 ].sample * 1000000000,
    "binding" => [ "ruby", "c", "cpp", "python" ].sample
  }
end

def make_result(name, parent, results, offsets)
  return {
    "name" => name,
    "parent" => parent,
    "fire_count" => results.length,
    "min_time" => results.min,
    "max_time" => results.max,
    "total_time" => results.reduce(:+),
    "total_time_sq" => results.reduce(0) { |sum, n| sum + n*n },
    "min_offset_time" => offsets.min,
    "max_offset_time" => offsets.max,
    "total_offset_time" => offsets.reduce(:+),
    "total_offset_time_sq" => offsets.reduce(0) { |sum, n| sum + n*n }
  }
end

def make_context(identity, name, start, tests_input)
  output = {
    "name" => name,
    "machine_identity" => identity,
    "start" => start,
    "results" => [
      {
        "name" => "root"
      },
    ]
  }

  tests_input.each do |name, r|

    count = r[:fire_count]
    results = [ r[:result_begin] ]
    offsets = [ r[:offset_begin] ]

    (1...count).each do |i|
      results << [ 0, results[-1] + r[:result_trend] + PRNG.rand(0..r[:result_jitter]) ].max
      offsets << [ 0, offsets[-1] + r[:offset_trend] + PRNG.rand(0..r[:offset_jitter]) ].max
    end

    output["results"] << make_result(name, r[:parent], results, offsets)
  end

  return JSON.pretty_generate(output)
end

def make_sequence(identity, name, epoch_start, epoch_end, count, tests)
  diff = (epoch_end - epoch_start) / count - 1
  times = (0...count).map { |i| epoch_start + i * diff }


  return times.map do |start|
    out = make_context(
      identity,
      name,
      start,
      tests
    )

    tests.each do |k, v|
      v[:result_begin] += v[:result_ongoing_trend]
      v[:offset_begin] += v[:offset_ongoing_trend]
    end

    next out
  end
end


class TestServer < Test::Unit::TestCase
  def setup
  end

  def teardown
  end

  def test_fill
    test_structure = {
      "test": {
        :parent => "root",
        :fire_count => 5,
        :result_begin => 1,
        :result_jitter => 0,
        :result_ongoing_trend => 1,
        :result_trend => 1,
        :offset_begin => 1,
        :offset_trend => 0,
        :offset_jitter => 3,
        :offset_ongoing_trend => 0,
      }
    }
    seq_a = make_sequence(
      make_identity(),
      "pork pork",
      1436304084,
      1438116139,
      50,
      test_structure
    )

    seq_b = make_sequence(
      make_identity(),
      "pork pork 2",
      1436304084,
      1438116139,
      50,
      test_structure
    )

    packages = []

    test_location = "test/data/filler/"
    seq_a.each_index do |i|
      a = seq_a[i]
      b = seq_b[i]

      FileUtils.rm_r(test_location) if File.exist?(test_location)
      FileUtils.mkdir_p(test_location)

      File.open("#{test_location}seq_a.json", 'w') do |f|
        f.write(seq_a[i])
      end
      File.open("#{test_location}seq_b.json", 'w') do |f|
        f.write(seq_b[i])
      end

      packages << Perf::Package.new("master", "af4343c", "pie", "#{test_location}/*.json", "test_recipe", "pork pork")
      packages << Perf::Package.new("master", "af4343c", "pie", "#{test_location}/*.json", "test_other_recipe", "pork pork")
    end

    # Currently not deleting the test data for dev purposes.
    open_perf_server "mongo_fill",false do |port|
      host = 'localhost'
      url = "http://#{host}:#{port}"
      packages.each { |p| p.submit("#{url}/submit"); sleep(0.01) }

      sleep(0.2)

      output = JSON.parse(Net::HTTP.get(host, "/summary", port))
      assert_equal 2, output.length
      assert_equal "test_other_recipe", output[0]["_id"]
      assert_equal "test_recipe", output[1]["_id"]
    end
  end

  def test_performance_tracking
=begin
  * 20-50 different values streams from ~10 json objects
  * some appearing some leaving
  * slightly varying in timing (and larger dips)
  * creating and destroying branches regularly, some longer than others
  * some recursive sections
  * commits rev vary each value.
=end
  end
end
