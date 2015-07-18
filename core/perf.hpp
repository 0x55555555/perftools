#pragma once
#include <chrono>
#include <stdexcept>
#include <string>
#include <experimental/optional>

#include "internal/perf_string.hpp"

namespace perf
{
#define PERF_EXPORT

class identity;
class config;
class context;

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

  ~config()
    {
    }

  /// Get the description for this config.
  const perf::identity &identity() const
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
  perf::identity m_identity;
  allocator_base m_allocator;
  std::atomic<std::size_t> m_context_count;
  };

class PERF_EXPORT context
  {
public:
  context(config *c, const char *name);
  context(config &c, const char *name)
    : context(&c, name)
    {
    }

  void event(const char *name);

  /// Find the config for this context.
  const perf::config *config() const
    {
    return m_config;
    }

private:
  const perf::config *m_config;
  };

class PERF_EXPORT meta_event
  {
public:
  meta_event(context *ctx, const char *name);
  meta_event(context &ctx, const char *name) : meta_event(&ctx, name)
    {
    }

  meta_event(meta_event *ev, const char *name);
  meta_event(meta_event &ev, const char *name) : meta_event(&ev, name)
    {
    }

  /// Fire the Event with a given [start] and [end] point.
  void fire(
    const std::chrono::high_resolution_clock::time_point &start,
    const std::chrono::high_resolution_clock::time_point &end);
  /// Fire the event at a specific point in time, with zero duration.
  void fire(const std::chrono::high_resolution_clock::time_point &point
              = std::chrono::high_resolution_clock::now());
  };

class PERF_EXPORT event
  {
public:
  event(meta_event *meta)
    : start(std::chrono::high_resolution_clock::now())
    {
    }

  event(meta_event &meta)
    : event(&meta)
    {
    }

  ~event()
    {
    m_meta->fire(start, std::chrono::high_resolution_clock::now());
    }

  meta_event *meta() { return m_meta; }
  const meta_event *meta() const { return m_meta; }

private:
  meta_event *m_meta;
  std::chrono::high_resolution_clock::time_point start;
  };

class PERF_EXPORT single_fire_event : public meta_event, public event
  {
public:
  single_fire_event(context *ctx, const char *name) : meta_event(ctx, name), event(this)
    {
    }

  single_fire_event(context &ctx, const char *name) : single_fire_event(&ctx, name)
    {
    }

  single_fire_event(event *evt, const char *name) : meta_event(evt->meta(), name), event(this)
    {
    }

  single_fire_event(event &evt, const char *name) : single_fire_event(&evt, name)
    {
    }

  void fire(const char *name)
    {
    perf::meta_event temp(this, name);
    temp.fire();
    }
  };

}
