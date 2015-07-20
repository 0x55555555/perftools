#pragma once
#include <chrono>
#include <mutex>
#include <stdexcept>
#include <string>
#include <experimental/optional>
#include <vector>

#include "internal/perf_string.hpp"

namespace perf
{
#define PERF_EXPORT

class identity;
class config;
class context;

namespace detail
{
class event_reference
  {
  std::size_t index;
  friend class perf::context;
  };
}

/// A descriptive class for a machines identity
/// Contains information about the performance statistics of the machine.
class PERF_EXPORT identity
  {
public:
  static identity this_machine(const char *binding);

  /// Get the machines description as json
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

  const perf::allocator_base &allocator() const
    {
    return m_allocator;
    }

  void register_context(context &);
  void unregister_context(context &);

private:
  identity m_identity;
  allocator_base m_allocator;
  std::atomic<std::size_t> m_context_count;
  };

class time
  {
public:
  static time now()
    {
    time t;
    t.m_time = std::chrono::high_resolution_clock::now();
    return t;
    }

  std::chrono::nanoseconds operator-(const time &t) const
    {
    return m_time - t.m_time;
    }

private:
  std::chrono::high_resolution_clock::time_point m_time;
  };

class PERF_EXPORT meta_event
  {
public:
  meta_event(context *ctx, const char *name)
    : meta_event(nullptr, ctx, name)
    {
    }
  meta_event(context &ctx, const char *name)
    : meta_event(&ctx, name)
    {
    }

  meta_event(meta_event *ev, const char *name)
    : meta_event(ev, ev->m_context, name)
    {
    }
  meta_event(meta_event &ev, const char *name)
    : meta_event(&ev, name)
    {
    }

  meta_event(meta_event *ev, context *ctx, const char *name);
  meta_event(const meta_event &) = delete;
  meta_event &operator=(const meta_event &) = delete;
  ~meta_event();


  /// Fire the Event with a given [start] and [end] point.
  void fire(const time &start, const time &end);
  /// Fire the event at a specific point in time, with zero duration.
  void fire(const time &point = time::now());

  perf::context *get_context() { return m_context; }
  const perf::context *get_context() const { return m_context; }

  detail::event_reference &get_event_reference() { return m_event; }
  const detail::event_reference &get_event_reference() const { return m_event; }

private:
  context *m_context;
  detail::event_reference m_event;
  };

class PERF_EXPORT event
  {
public:
  event(meta_event *meta)
    : m_meta(meta)
    , m_start(time::now())
    {
    }

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

  meta_event *get_meta_event() { return m_meta; }
  const meta_event *get_meta_event() const { return m_meta; }

private:
  meta_event *m_meta;
  time m_start;
  };

class PERF_EXPORT single_fire_event : public meta_event, public event
  {
public:
  single_fire_event(perf::context *ctx, const char *name) : meta_event(ctx, name), event(this)
    {
    }

  single_fire_event(perf::context &ctx, const char *name) : single_fire_event(&ctx, name)
    {
    }

  single_fire_event(perf::event *evt, const char *name) : meta_event(evt->get_meta_event(), name), event(this)
    {
    }

  single_fire_event(perf::event &evt, const char *name) : single_fire_event(&evt, name)
    {
    }

  single_fire_event(const single_fire_event &) = delete;
  single_fire_event &operator=(const single_fire_event &) = delete;

  void fire(const char *name)
    {
    perf::meta_event temp(this, name);
    temp.fire();
    }
  };

class PERF_EXPORT context
  {
public:
  context(config *c, const char *name);
  context(config &c, const char *name)
    : context(&c, name)
    {
    }
  context(const context &) = delete;
  context &operator=(const context &) = delete;
  ~context();

  /// Find the config for this context.
  const config *get_config() const
    {
    return m_config;
    }

  const short_string &name() const { return m_name; }

  detail::event_reference add_event(const char *name, detail::event_reference *parent = nullptr);
  void fire_event(
    detail::event_reference &event,
    const time &begin,
    const time &end);
  void fire_event(
    detail::event_reference &event,
    const time &point);
  void finish_event(detail::event_reference &parent);

private:
  struct event
    {
    event(const char *name, detail::event_reference *parent);
    event(event &&ev);
    event &operator=(event &&ev);

    std::size_t parent;
    short_string name;

    std::atomic<std::size_t> fire_count;
    std::atomic<std::uint64_t> min_time;
    std::atomic<std::uint64_t> max_time;
    std::atomic<std::uint64_t> total_time;
    std::atomic<std::uint64_t> total_time_sq;
    };

  std::mutex m_events_mutex;
  config *m_config;
  std::vector<event, allocator<event>> m_events;

  short_string m_name;
  single_fire_event m_root;
  };

}
