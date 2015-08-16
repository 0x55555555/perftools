#pragma once
#include "perf_event.hpp"
#include <iostream>

namespace perf
{

/// \brief Specific utilities for benchmarking a
/// piece of code by running it repeatedly.
/// \ingroup CPP_API
namespace benchmark
{

/// \brief A set of parameters for performing benchmarks,
/// allowing a user to customise how many times code
/// is run and warmed up.
class parameters
  {
public:
  parameters()
    {
    }

  /// Find a set of parameters to run code [n] times.
  static parameters run_n_times(std::size_t n)
    {
    parameters ret;
    ret.warm_up_count = 0;
    ret.max_fire_count = n;
    ret.min_fire_count = n;
    ret.max_sd_multiplier = 0.0;
    return ret;
    }

  /// Find a set of parameters used to warm up code blocks.
  /// \note Runs code a fixed number of times.
  parameters warm_up_parameters() const
    {
    return run_n_times(warm_up_count);
    }

  std::size_t warm_up_count = 10;
  double max_sd_multiplier = 0.1;
  std::size_t max_fire_count = 100;
  std::size_t min_fire_count = 2;

  /// Find if the parameters are satisfied by [ev]'s current state.
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

/// \brief A wrapper around a current benchmark session,
/// which the owner can decide to begin when they like.
class wrapper
  {
public:
  std::function<perf::event()> fire;

  /// Begin profiling for this wrapper.
  perf::event operator()() const
    {
    return fire();
    }
  };

/// Benchmark [f] under the [parent], timing [f] (which should fire child events internally) and repeating until [params] pass.
template <typename Fn> void benchmark_specific(event &parent, const char *name, const Fn &f, const parameters &param = parameters())
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

  wrapper fire{ [&]() { return parent.fire_child(benchmark); } };

  while (!param.can_stop(benchmark.get_context()->event_for(benchmark.get_event_reference())))
    {
    f(fire);
    }
  }

/// Benchmark [f] under the root event, timing [f] (which should fire child events internally) and repeating until [params] pass.
template <typename Fn> void benchmark_specific(context &ctx, const char *name, const Fn &f, const parameters &params = parameters())
  {
  benchmark_specific(ctx.root_event(), name, f, params);
  }

/// Benchmark [f] under the [parent], sinply timing [f] and repeating until [params] pass.
template <typename Fn> void benchmark(event &parent, const char *name, const Fn &f, const parameters &params = parameters())
  {
  auto wrapper_f = [&f](const wrapper &begin_timing)
    {
    auto timer = begin_timing();
    f();
    };

  benchmark_specific(parent, name, wrapper_f, params);
  }

/// Benchmark [f] under the root event, sinply timing [f] and repeating until [params] pass.
template <typename Fn> void benchmark(context &ctx, const char *name, const Fn &f, const parameters &params = parameters())
  {
  benchmark(ctx.root_event(), name, f, params);
  }

}
}
