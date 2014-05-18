#include "perf_context.h"

perf_context *perf_context::init(perf_config *c)
  {
  PERF_API_CHECK_PTR(c);

  auto a = c->create<perf_context>();

  a->m_records = decltype(m_records)(perf_allocator<Record>(c));
  c->addContext(a);

  return a;
  }

bool perf_context::check(const perf_context *c)
  {
  return c != 0;
  }

void perf_context::term(perf_context *c)
  {
  c->m_config->destroy(c);
  }

perf_context::perf_context()
    : m_config(nullptr),
      m_error(perf_no_error)
  {
  }

perf_context::Record::Record(const char *c, perf_context *ctx, const perf_relative_time &t)
    : m_name(c, ctx->config()),
      m_time(t)
  {
  }

void perf_context::record(const char *id)
  {
  perf_relative_time rel = perf_absolute_time().relativeTo(m_start);

  m_records.emplace_back(id, this, rel);
  }
