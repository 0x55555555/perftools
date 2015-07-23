#pragma once

namespace perf
{

class context;

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


}
