#include "perf_meta_event.hpp"
#include "perf_context.hpp"

namespace perf
{
meta_event::meta_event(meta_event *parent, context *ctx, const char *name)
  : m_context(ctx)
  , m_event(detail::event_reference::invalid_reference())
  {
  m_event = ctx->add_event(name, parent ? &parent->m_event : nullptr);
  }

meta_event::~meta_event()
  {
  m_context->finish_event(m_event);
  }

void meta_event::fire(const time &parent_start, const time &start, const time &end)
  {
  m_context->fire_event(m_event, parent_start, start, end);
  }

void meta_event::fire(const time &parent_start, const time &point)
  {
  m_context->fire_event(m_event, parent_start, point);
  }
  
bool meta_event::validate_parent(const meta_event *ev)
  {
  if (ev->get_context() != get_context())
    {
    return false;
    }
  
  auto &ev_data = ev->get_context()->event_for(get_event_reference());
  if (ev_data.parent == detail::event_reference::invalid_reference())
    {
    return true;
    }
  
  return ev_data.parent == ev->get_event_reference();
  }
}
