#pragma once
#include "perf_meta_event.hpp"

namespace perf
{

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

  const time &start_time() const { return m_start; }

private:
  meta_event *m_meta;
  time m_start;
  };

}
