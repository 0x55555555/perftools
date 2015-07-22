#include "perf.hpp"

namespace perf
{
meta_event::meta_event(meta_event *parent, context *ctx, const char *name)
  : m_context(ctx)
  {
  m_event = ctx->add_event(name, parent ? &parent->m_event : nullptr);
  }

meta_event::~meta_event()
  {
  m_context->finish_event(m_event);
  }

void meta_event::fire(const time &start, const time &end)
  {
  m_context->fire_event(m_event, start, end);
  }

void meta_event::fire(const time &point)
  {
  m_context->fire_event(m_event, point);
  }
}
