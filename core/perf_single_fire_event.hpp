#pragma once
#include "perf_event.hpp"
#include "perf_meta_event.hpp"

namespace perf
{

/// A single fire event creates a meta_event and fires it in a single object
/// Useful for one off events
class PERF_EXPORT single_fire_event : public meta_event, public event
  {
public:
  /// Fire a new event under [ctx], called [name]
  single_fire_event(perf::context *ctx, const char *name);

  /// Fire a new event under [ctx], called [name]
  single_fire_event(perf::context &ctx, const char *name) : single_fire_event(&ctx, name)
    {
    }

  /// Fire a new event under [evt], called [name]
  single_fire_event(perf::event *evt, const char *name) : meta_event(evt->get_meta_event(), name), event(evt, this)
    {
    }

  /// Fire a new event under [evt], called [name]
  single_fire_event(perf::event &evt, const char *name) : single_fire_event(&evt, name)
    {
    }

  single_fire_event(const single_fire_event &) = delete;
  single_fire_event &operator=(const single_fire_event &) = delete;

  /// Fire a new event under this event, called [name]
  void fire(const char *name)
    {
    perf::meta_event temp(this, name);
    temp.fire(start_time());
    }
  };

}
