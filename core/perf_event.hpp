#pragma once
#include "perf_meta_event.hpp"

namespace perf
{

/// An active timing session, instancing a meta_event
/// The meta_event is begun when the constructor is called
/// And ended when the destructor fires.
/// \note Events can be constructed in multiple threads for the same meta_event.
/// \ingroup CPP_API
class PERF_EXPORT event
  {
public:
  /// Start an event for a meta_event
  event(const event *parent, meta_event *meta)
    : m_meta(meta)
    , m_parent(parent)
    {
    PERF_ASSERT(meta->validate_parent(parent->get_meta_event()));
    m_start = time::now();
    }

  /// Start an event for a meta_event
  event(const event &parent, meta_event &meta)
    : event(&parent, &meta)
    {
    }

  event(event &&ev)
    : m_meta(ev.m_meta)
    , m_parent(ev.m_parent)
    , m_start(ev.m_start)
    {
    }

  event &operator=(event &&ev)
    {
    m_meta = ev.m_meta;
    m_parent = ev.m_parent;
    m_start = ev.m_start;
    return *this;
    }

  event(const event &) = delete;
  event &operator=(const event &) = delete;

  ~event()
    {
    m_meta->fire(m_parent->start_time(), m_start, time::now());
    }

  /// Find the meta_event for this event
  meta_event *get_meta_event() { return m_meta; }
  /// Find the meta_event for this event
  const meta_event *get_meta_event() const { return m_meta; }

  /// Find the start time of this event
  const time &start_time() const { return m_start; }

  /// Fire a child event
  event fire_child(meta_event *ev)
    {
    return event(this, ev);
    }

  /// Fire a child event
  event fire_child(meta_event &ev)
    {
    return event(this, &ev);
    }

private:
  meta_event *m_meta;
  const event *m_parent;
  time m_start;
  };

}
