require 'rake/testtask'

#desc 'Default: run specs.'
task :default => :tests

# desc run cpp tests
Rake::TestTask.new(:cpp_tests) do |t|

  cmd = %{
cd #{File.dirname(__FILE__)}
mkdir -p test/data
mkdir -p build
cd build
cmake ..
cmake --build .
ctest
echo `pwd`
}

  output = `#{cmd}`
  if ($?.exitstatus != 0)
    raise "Failed to run cpp tests" + output
  end
end

# desc run python tests
Rake::TestTask.new(:python3_tests) do |t|
  output = `python3 test/python/test.py`

  if ($?.exitstatus != 0)
    raise "Failed to run python tests" + output
  end
end

# desc "Run specs"
Rake::TestTask.new(:ruby_tests) do |t|
  t.libs = ["test"]
  t.test_files = FileList["./test/ruby/*Test.rb"]
end

task tests: [:cpp_tests, :python3_tests, :ruby_tests] do |t|
end
