#include "perf_config.hpp"
#include "perf_context.hpp"
#include <cassert>

perf_config *perf_config::init(perf_alloc alloc, perf_free free, const char *binding)
  {
  perf_ptr_check(alloc);
  perf_ptr_check(free);
  perf_ptr_check(binding);

  auto a = perf_config::create<perf_config>(
    alloc,
    binding,
    alloc,
    free);
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

perf_config::perf_config(
    const char *binding,
    perf_alloc alloc,
    perf_free free)
  : m_context_count(0)
  , m_alloc(alloc)
  , m_free(free)
  , m_identity(binding, this)
  {
  m_identity.init();
  }

void perf_config::add_context(perf_context *c)
  {
  c->m_config = this;
  ++m_context_count;
  }

void perf_config::remove_context(perf_context *c)
  {
  assert(c->m_config);
  c->m_config = nullptr;
  --m_context_count;
  }
