require_relative '../../bindings/ruby/lib/perf.rb'

class Stream
  StreamAverageRange = 0.4..54
  StreamRegularity = (60 * 60)..(24 * 60 * 60)
  StreamChangeFrequency = (15 * 24 * 60 * 60)..(60 * 24 * 60 * 60)

  def initialize()
  end

  def change()
  end
end

class Test
  TestFrequency = (7 * 24 * 60 * 60)..(30 * 24 * 60 * 60)
  def initialize(stream_count)
    @streams = rand(stream_count).times.collect { Stream.new() }
  end

  def generate(start, length)
  end
end

def generate_tests(
    tests:,
    to_add:,
    to_remove:,
    stream_count_per_test:)
  new_tests = to_add.times.collect { Test.new(stream_count_per_test) }
  tests.concat(new_tests)

  to_remove.times do
    tests.delete_at(rand(tests.length))
  end
end

def test_performance_tracking(
    add_per_iteration: 0..4,
    remove_per_iteration: 0..2,
    creation_sections: 100,
    creation_event_time: (7 * 24 * 60 * 60)..(30 * 24 * 60 * 60),
    stream_count_per_test: 1..4)

  time_now = Time.now.to_i
  tests = []
  (0...creation_sections).each do |i|
    to_add = rand(add_per_iteration)
    to_remove = rand(remove_per_iteration)

    generate_tests(
      tests: tests,
      to_add: to_add,
      to_remove: to_remove,
      stream_count_per_test: stream_count_per_test)

    length = rand(creation_event_time)
    tests.each { |t| t.generate(time_now, length) }
  end
=begin
* 20-50 different values streams from ~10 json objects
* some appearing some leaving
* slightly varying in timing (and larger dips)
* creating and destroying branches regularly, some longer than others
* some recursive sections
* commits rev vary each value.
=end
end

test_performance_tracking()
