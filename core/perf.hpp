#pragma once
#include <chrono>
#include <mutex>
#include <stdexcept>
#include <string>
#include <experimental/optional>
#include <vector>

#include "perf_string.hpp"

namespace perf
{
#define PERF_EXPORT

class identity;
class config;
class context;

namespace detail
{

class private_dummy
  {
private:
  private_dummy() { }
  private_dummy(const private_dummy &) = delete;
  private_dummy &operator=(const private_dummy &) = delete;
  friend class perf::context;
  };

class event_reference
  {
public:
  bool operator!=(const event_reference &ev) const
    {
    return index != ev.index;
    }
  
private:
  std::size_t index = std::numeric_limits<std::size_t>::max();
  friend class perf::context;
  };
}

/// A descriptive class for a machines identity
/// Contains information about the performance statistics of the machine.
class PERF_EXPORT identity
  {
public:
  /// Find the identity for the machine executing this code.
  static identity this_machine(const char *binding);

  /// Get the machines description as json.
  void json_description(string &, const char *line_start="") const;

protected:
  identity() { }

  short_string m_cpu;
  short_string m_binding;
  short_string m_arch;
  short_string m_os;
  short_string m_extra;
  std::size_t m_cpu_count;
  std::size_t m_thread_count;
  std::size_t m_cpu_hz;
  std::size_t m_memory_bytes;
  };

/// A config holds whole library information for perf to use
/// including allocation strategies, and identity information.
class PERF_EXPORT config
  {
public:
  config(const char *binding="cpp", const allocator_base &a = allocator_base());
  config(const config &) = delete;
  config &operator=(const config &) = delete;

  ~config()
    {
    }

  /// Get the description for this config.
  const perf::identity &get_identity() const
    {
    return m_identity;
    }

  /// Get the allocator to be used internally in perf.
  const perf::allocator_base &allocator() const
    {
    return m_allocator;
    }

  /// When a context is constructed this is called internally.
  /// \private
  void register_context(context &, const detail::private_dummy &);
  /// When a context is destroyed this is called internally.
  /// \private
  void unregister_context(context &, const detail::private_dummy &);

private:
  identity m_identity;
  allocator_base m_allocator;
  std::atomic<std::size_t> m_context_count;
  };

/// A time point in the current system, relative to some unknown clock.
class time
  {
public:
  /// Find a time point for now.
  static time now()
    {
    time t;
    t.m_time = std::chrono::high_resolution_clock::now();
    return t;
    }

  /// Find a nanosecond value, by finding the relative time between two time points.
  std::chrono::nanoseconds operator-(const time &t) const
    {
    return m_time - t.m_time;
    }

private:
  std::chrono::high_resolution_clock::time_point m_time;
  };

/// A descriptor for an event, containing a name and a handle to fire it.
/// \note it is safe to use a single context to create meta_events from multiple threads
class PERF_EXPORT meta_event
  {
public:
  /// Create an event under [ctx], with identifier [name]
  meta_event(context *ctx, const char *name)
    : meta_event(nullptr, ctx, name)
    {
    }
  /// Create an event under [ctx], with identifier [name]
  meta_event(context &ctx, const char *name)
    : meta_event(&ctx, name)
    {
    }

  /// Create an event under [parent], with identifier [name]
  meta_event(meta_event *parent, const char *name)
    : meta_event(parent, parent->m_context, name)
    {
    }
  /// Create an event under [parent], with identifier [name]
  meta_event(meta_event &parent, const char *name)
    : meta_event(&parent, name)
    {
    }

  /// Create an event under [parent], in context [ctx] with identifier [name].
  /// \note [parent] can be nullptr
  meta_event(meta_event *parent, context *ctx, const char *name);

  meta_event(const meta_event &) = delete;
  meta_event &operator=(const meta_event &) = delete;
  ~meta_event();


  /// Fire the Event with a given [start] and [end] point.
  void fire(const time &start, const time &end);
  /// Fire the event at a specific point in time, with zero duration.
  void fire(const time &point = time::now());

  /// Find the context for this event
  perf::context *get_context() { return m_context; }
  /// Find the context for this event
  const perf::context *get_context() const { return m_context; }

  /// Get the reference for this event held in the context
  /// \private
  detail::event_reference &get_event_reference() { return m_event; }
  /// Get the reference for this event held in the context
  /// \private
  const detail::event_reference &get_event_reference() const { return m_event; }

private:
  context *m_context;
  detail::event_reference m_event;
  };

/// An active timing session, instancing a meta_event
/// The meta_event is begun when the constructor is called
/// And ended when the destructor fires.
/// \note Events can be constructed in multiple threads for the same meta_event.
class PERF_EXPORT event
  {
public:
  /// Start an event for a meta_event
  event(meta_event *meta)
    : m_meta(meta)
    , m_start(time::now())
    {
    }

  /// Start an event for a meta_event
  event(meta_event &meta)
    : event(&meta)
    {
    }

  event(const event &) = delete;
  event &operator=(const event &) = delete;

  ~event()
    {
    m_meta->fire(m_start, time::now());
    }

  /// Find the meta_event for this event
  meta_event *get_meta_event() { return m_meta; }
  /// Find the meta_event for this event
  const meta_event *get_meta_event() const { return m_meta; }

private:
  meta_event *m_meta;
  time m_start;
  };

/// A single fire event creates a meta_event and fires it in a single object
/// Useful for one off events
class PERF_EXPORT single_fire_event : public meta_event, public event
  {
public:
  /// Fire a new event under [ctx], called [name]
  single_fire_event(perf::context *ctx, const char *name) : meta_event(ctx, name), event(this)
    {
    }

  /// Fire a new event under [ctx], called [name]
  single_fire_event(perf::context &ctx, const char *name) : single_fire_event(&ctx, name)
    {
    }

  /// Fire a new event under [evt], called [name]
  single_fire_event(perf::event *evt, const char *name) : meta_event(evt->get_meta_event(), name), event(this)
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
    temp.fire();
    }
  };

}

#include "perf_context.hpp"
#include "perf_json_writer.hpp"
