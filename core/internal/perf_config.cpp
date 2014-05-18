#include "perf_config.h"
#include "perf_context.h"
#include <cassert>

perf_config *perf_config::init(perf_alloc alloc, perf_free free)
  {
  PERF_API_CHECK_PTR(alloc);
  PERF_API_CHECK_PTR(free);

  auto a = perf_config::create<perf_config>(alloc);
  a->m_alloc = alloc;
  a->m_free = free;
  return a;
  }

bool perf_config::check(const perf_config *c)
  {
  return c != 0;
  }

void perf_config::term(perf_config *c)
  {
  destroy(c->m_free, c);
  }

void perf_config::addContext(perf_context *c)
  {
  c->m_config = this;
  ++m_contextCount;
  }

void perf_config::removeContext(perf_context *c)
  {
  assert(c->m_config);
  c->m_config = nullptr;
  --m_contextCount;
  }
