require 'optparse'
require_relative 'perf.rb'

class PerfCmdLine

  def error(str)
    puts str
    exit 1
  end

  def option_error(str, args)
    error("#{str}: #{args}")
  end

  def repository_information(dir)
    if (File.directory?(dir + "/.git"))

      commit = `git describe`.strip
      return {
        :commit => commit,
        :branch => `git rev-parse --abbrev-ref HEAD`.strip,
        :description => ` git log --format=%B -n 1 #{commit}`.strip
      }
    end

    error("Unable to determine repository version control type.")
  end

  def get_options(argv)
    # Setup default options.
    options = {
      :verbose => false,
      :url => "http://localhost:3000",
    }

    # Parse out any arguments, leaving remaining arguments in extra.
    extra = argv.dup
    OptionParser.new do |opts|
      opts.banner = "Usage: perf [options]"

      opts.on("-v", "--[no-]verbose", "Run verbosely") do |v|
        options[:verbose] = v
      end

      opts.on("-m", "--message M", "Comment for the result set.") do |v|
        options[:comment] = v
      end

      opts.on("-f", "--files M", "File pattern to submit.") do |v|
        options[:files] = v
      end

      opts.on("-u", "--url M", "Server url to submit to.") do |v|
        options[:url] = v
      end
    end.parse!(extra)

    option_error("Too many extra arguments", extra[1..-1]) unless extra.length <= 1
    option_error("Recipe not specified", argv) unless extra.length >= 1
    options[:recipe] = extra[-1]

    option_error("File pattern not specified", argv) unless options[:files]

    return options
  end

  def run(argv)
    options = get_options(argv)

    repo = repository_information(Dir.pwd)

    pkg = Perf::Package.new(
      repo[:branch],
      repo[:commit],
      repo[:description],
      options[:files],
      options[:recipe],
      options[:comment])

    pkg.submit("#{options[:url]}/submit")

    puts "Successfully submitted."
  end
end
