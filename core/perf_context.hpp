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

/// A context stores and maintains a group of events.
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

  /// Find the name for the context
  const short_string &name() const { return m_name; }

  /// Create a new event in the context
  detail::event_reference add_event(const char *name, detail::event_reference *parent = nullptr);
  /// Fire [event] with a [begin] and [end]
  void fire_event(
    detail::event_reference &event,
    const time &begin,
    const time &end);
  /// Fire [event] at [point]
  void fire_event(
    detail::event_reference &event,
    const time &point);
  /// Finish [event]
  void finish_event(detail::event_reference &event);

  /// Internal storage for an event, containing aggregated data about the firings.
  struct event
    {
    event(const char *name, const detail::event_reference &parent);
    event(event &&ev);
    event &operator=(event &&ev);

    detail::event_reference parent;
    short_string name;

    std::atomic<std::size_t> fire_count;
    std::atomic<std::uint64_t> min_time;
    std::atomic<std::uint64_t> max_time;
    std::atomic<std::uint64_t> total_time;
    std::atomic<std::uint64_t> total_time_sq;
    };
  
  /// Find all events contained in the context
  const std::vector<event, allocator<event>> &events() const { return m_events; }
  
  /// Find an event by reference
  const event &event_for(const detail::event_reference &ev) const { return m_events[ev.index]; }

private:
  std::mutex m_events_mutex;
  config *m_config;
  std::vector<event, allocator<event>> m_events;

  short_string m_name;
  single_fire_event m_root;
  };

}
