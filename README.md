perfstack
=========

System for testing performance of applications

Performance Gathering
---------------------

perfstack has several bindings to gather performance results. All bindings produce a common file format,
and can be mixed together in profiling sessions.

### C++ Bindings
The top level bindings are written in C++, all other bindings use C++ internally.

The below code tests the performance of a piece of code called "block":

```cpp
perf::config cfg;
perf::context ctx(cfg, "my context");

perf::meta_event blk(ctx, "block");

{
  auto f = ctx.fire_child(blk);

  /// performamce critical work
}

perf::json_writer json;
json.write(ctx, "cpp.json");
```

perfstack also contains utilities to benchmark code by running it repeatedly:

```cpp
perf::config cfg;
perf::context ctx(cfg, "my context");

perf::benchmark(ctx, "string_appending", []()
{
  std::string a("test");
  a += "pork";
});
```

### C Bindings

perfstack wraps the C++ bindings in C to allow other languages to utilise it.

```c
auto config = perf_init_default_config("c");
auto context = perf_init_context(config, "c_test");

auto meta = perf_init_meta_event(context, "test");

{
  auto event = perf_init_event(meta);
  /// perfornamce critical work

  perf_term_event(event);
}

perf_write_context(context, "c.json");

perf_term_meta_event(meta);
perf_term_context(context);
perf_term_config(config);
```

### Python 3 Bindings

Python 3 can be used to generate performance data.

```python
import perf

cfg = perf.Config()
ctx = perf.Context(cfg, "test")

ev1 = perf.MetaEvent(ctx, "pork1")
ev2 = perf.MetaEvent(ctx, "pork2")


with perf.Event(ev1):
    # perormance critical work

    with perf.Event(ev2):
        # inner perormance critical work

ctx.write("python.json")
```

### Ruby Bindings

Ruby can also generate performance data

```ruby
cfg = Perf::Config.new()
ctx = Perf::Context.new(cfg, "timing_test")

ctx.block("test_block") do
  # Timed block
end

ctx.write("ruby.json")
```
