require "ffi"
require 'rbconfig'
require 'json'
require 'net/http'

module Perf
  extend FFI::Library

  module Utils

    def self.os
      @os ||= (
        host_os = RbConfig::CONFIG['host_os']
        case host_os
        when /mswin|msys|mingw|cygwin|bccwin|wince|emc/
          :windows
        when /darwin|mac os/
          :macosx
        when /linux/
          :linux
        when /solaris|bsd/
          :unix
        else
          raise "unknown os: #{host_os.inspect}"
        end
      )
    end

    def self.path()
      base = File.dirname(__FILE__) + "/../../../core/build/bin/libperf"
      case os
        when :macosx
          return base + ".dylib"
        when :windows
          return base + ".dll"
        when :linux 
          return base + ".so"
      end
    end
  end

  ffi_lib Utils.path()

  class LibIdentity < FFI::Struct
    layout :impl,  :pointer
  end

  class LibConfig < FFI::ManagedStruct
    layout :impl,  :pointer

    def self.release(ptr)
      self.perf_term_config(ptr)
    end
  end

  class LibContext < FFI::ManagedStruct
    layout :impl,  :pointer

    def self.release(ptr)
      self.perf_term_context(ptr)
    end
  end
  
  attach_function :perf_init_default_config, [ :string ], :pointer
  attach_function :perf_term_config, [ :pointer ], :void

  attach_function :perf_find_identity, [ :pointer ], :pointer
  attach_function :perf_identity_description, [ :pointer ], :string

  attach_function :perf_init_context, [ :pointer, :string ], :pointer
  attach_function :perf_term_context, [ :pointer ], :void

  attach_function :perf_add_event, [ :pointer, :string ], :void

  attach_function :perf_dump_context, [ :pointer ], :string
  attach_function :perf_write_context, [ :pointer, :string ], :void

  enum :error, [
    :no_error, 0,
    :error_in_error, 1,
    :invalid_config, 2, 
  ]

  attach_function :perf_check_error, [ :pointer ], :error
  
  class Identity
    def initialize(cfg)
      @ptr = LibIdentity.new(Perf.perf_find_identity(cfg.ptr))
    end

    def to_s
      return Perf.perf_identity_description(@ptr)
    end
  end

  class Config
    def initialize()
      @ptr = LibConfig.new(Perf.perf_init_default_config("ruby"))
    end

    attr_reader :ptr

    def identity
      return Identity.new(self)
    end
  end

  class Context
    def initialize(config, name)
      @ptr = LibContext.new(Perf.perf_init_context(config.ptr, name))
    end

    attr_reader :ptr

    def error
      return Perf.perf_check_error(@ptr)
    end

    def dump
      return Perf.perf_dump_context(@ptr)
    end

    def write(f)
      return Perf.perf_write_context(@ptr, f)
    end

    def event(name)
      Perf.perf_add_event(@ptr, name)
    end

    def block(name)
      b = "#{name}::begin"
      e = "#{name}::end"
      event(b)
      yield
      event(e)
    end
  end

  class Package
    def initialize(branch, identity, description, files, recipe=nil)
      @contexts = Dir.glob(files).reduce({}) do |a, f| 
        a[f] = JSON.parse(File.read(f))
        next a
      end

      @branch = branch
      @identity = identity
      @description = description
      @recipe = recipe
    end

    def to_s()
      outputContexts = { }

      @contexts.each do |file, json|
        name = json["name"]
        raise "invalid name passed" unless name.length > 0

        output = json.clone()
        output.delete("name")
        outputContexts[name] = output
      end

      return JSON.pretty_generate({
        :branch => @branch,
        :identity => @identity,
        :description => @description,
        :recipe => @recipe,
        :contexts => outputContexts
      })
    end

    def submit(addr)
      data = { 'data' => to_s }
      postData = Net::HTTP.post_form(URI.parse(addr), data)

      puts postData.body
    end
  end
end