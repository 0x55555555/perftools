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

  puts `#{cmd}`
  if ($?.exitstatus != 0)
    raise "Failed to run cpp tests"
  end
end

# desc "Run specs"
Rake::TestTask.new(:ruby_tests) do |t|
  t.libs = ["test"]
  t.test_files = FileList["./test/*Test.rb"]
end

task tests: [:cpp_tests, :ruby_tests] do |t|
end
