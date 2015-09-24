require_relative '../../bindings/ruby/lib/perf.rb'

class Stream
  StreamAverageRange = 0.4..54
  StreamVariance = 0..20
  StreamChangeFrequency = (15 * 24 * 60 * 60)..(60 * 24 * 60 * 60)

  NameInputs = [
    :Puff,
    :Pudding,
    :Pie,
    :Battery,
    :Staple,
    :Cheese
  ]
  NameExtras = [
    :Faster,
    :Better,
    :Slower,
    :Slicker,
    :Shiny,
    :Old,
    :New,
    ""
  ]

  def initialize()
    change()
    @name = [ NameExtras.sample ].concat((0..rand(1..2)).map{ NameInputs.sample }).join(" ").strip()
  end

  def name()
    return @name
  end

  def change()
    @value = rand(StreamAverageRange)
    @variance = rand(StreamVariance)
    @change_frequency = rand(StreamChangeFrequency)
    @unchanged_time = 0
  end

  def add_time(time)
    @unchanged_time += time

    if (@unchanged_time > @change_frequency)
      change()
    end
  end

  def sample()
    return @value + rand(-@variance..@variance)
  end
end

class Test
  TestFrequency = (7 * 24 * 60 * 60)..(30 * 24 * 60 * 60)
  def initialize(stream_count)
    @streams = rand(stream_count).times.collect { Stream.new() }
    @frequency = rand(TestFrequency)
  end

  def generate(start, length)
    (length/@frequency).times do |i|
      @streams.each { |s| s.add_time(@frequency) }

      puts Hash[@streams.map { |s| [s.name, s.sample()] }]
    end
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
