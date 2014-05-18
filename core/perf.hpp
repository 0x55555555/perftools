#pragma once
#include "perf.h"
#include <stdexcept>

namespace perf
{

class PERF_EXPORT identity
  {
  const char *description()
    {
    const char *desc = perf_identity_description(m_id);
    if (!desc)
      {
      throw std::runtime_error("failed to initialise identity description");
      }

    return desc;
    }

protected:
  identity(const perf_identity *id)
    {
    if (!id)
      {
      throw std::runtime_error("failed to initialise identity");
      }
    m_id = id;
    }

  friend class config;
  const perf_identity *m_id;
  };

class PERF_EXPORT config
  {
public:
  config(perf_alloc a=std::malloc, perf_free f=std::free)
    {
    m_cfg = perf_init_config(a, f);
    if (!m_cfg)
      {
      throw std::runtime_error("failed to initialise config");
      }
    }

  ~config()
    {
    perf_term_config(m_cfg);
    }

  perf::identity identity()
    {
    return perf::identity(perf_find_identity(m_cfg));
    }

private:
  perf_config *m_cfg;
  friend class context;
  };

class PERF_EXPORT context
  {
public:
  context(config *c)
    {
    m_ctx = perf_init_context(c->m_cfg);
    if (!m_ctx)
      {
      throw std::runtime_error("failed to initialise context");
      }
    }

  ~context()
    {
    perf_term_context(m_ctx);
    }

private:
  perf_context *m_ctx;
  };

}
