#pragma once
#include "perf_event.hpp"
#include <iostream>

namespace perf
{

class benchmark_parameters
  {
public:
  benchmark_parameters()
    {
    }
  
  static benchmark_parameters run_n_times(std::size_t times)
    {
    benchmark_parameters ret;
    ret.warm_up_count = 0;
    ret.max_fire_count = times;
    ret.min_fire_count = times;
    ret.max_sd_multiplier = 0.0;
    return ret;
    }
  
  benchmark_parameters warm_up_parameters() const
    {
    return run_n_times(warm_up_count);
    }
  
  std::size_t warm_up_count = 10;
  double max_sd_multiplier = 0.1;
  double max_fire_count = 100;
  double min_fire_count = 2;
  
  bool can_stop(const context::event &ev) const
    {
    if (ev.fire_count < min_fire_count)
      {
      return false;
      }
    
    if (ev.fire_count > max_fire_count)
      {
      return true;
      }
    
    return ev.sd() < max_sd_multiplier * ev.average();
    }
  };
  

/// Benchmark [f] under the [parent], timing [f] (which should fire child events internally) and repeating until [params] pass.
template <typename Fn> void benchmark_specific(event &parent, const char *name, const Fn &f, const benchmark_parameters &param = benchmark_parameters())
  {
  auto allocator = parent.get_meta_event()->get_context()->get_config()->allocator();
  
  // Possibly warm up the function by running it in another group.
  if (param.warm_up_count > 0)
    {
    auto warm_up_name = perf::string(name, allocator);
    warm_up_name += "_warm_up";
    
    benchmark_specific(parent, warm_up_name.c_str(), f, param.warm_up_parameters());
    }
  
  meta_event benchmark(parent.get_meta_event(), name);

  auto fire = [&]() { return parent.fire_child(benchmark); };

  while (!param.can_stop(benchmark.get_context()->event_for(benchmark.get_event_reference())))
    {
    f(fire);
    }
  }

/// Benchmark [f] under the root event, timing [f] (which should fire child events internally) and repeating until [params] pass.
template <typename Fn> void benchmark_specific(context &ctx, const char *name, const Fn &f, const benchmark_parameters &params = benchmark_parameters())
  {
  benchmark_specific(ctx.root_event(), name, f, params);
  }


/// Benchmark [f] under the [parent], sinply timing [f] and repeating until [params] pass.
template <typename Fn> void benchmark(event &parent, const char *name, const Fn &f, const benchmark_parameters &params = benchmark_parameters())
  {
  auto wrapper_f = [&f](auto &begin_timing)
    {
    auto timer = begin_timing();
    f();
    };

  benchmark_specific(parent, name, wrapper_f, params);
  }

/// Benchmark [f] under the root event, sinply timing [f] and repeating until [params] pass.
template <typename Fn> void benchmark(context &ctx, const char *name, const Fn &f, const benchmark_parameters &params = benchmark_parameters())
  {
  benchmark(ctx.root_event(), name, f, params);
  }

}
