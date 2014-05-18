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
  config(const char *binding="cpp", perf_alloc a=std::malloc, perf_free f=std::free)
    {
    m_cfg = perf_init_config(a, f, binding);
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
  context(config *c, const char *name)
    {
    m_ctx = perf_init_context(c->m_cfg, name);
    if (!m_ctx)
      {
      throw std::runtime_error("failed to initialise context");
      }
    }

  ~context()
    {
    perf_term_context(m_ctx);
    }

  void event(const char *name)
    {
    perf_add_event(m_ctx, name);
    }

  const char *dump()
    {
    return perf_dump_context(m_ctx);
    }

  void write(const char *name)
    {
    perf_write_context(m_ctx, name);
    }

private:
  perf_context *m_ctx;
  };

class PERF_EXPORT process
  {
public:
  process(context *ctx, const char *name) : m_ctx(ctx)
    {
    if (!ctx)
      {
      throw std::runtime_error("invalid context passed");
      }

    const size_t len = strlen(name);
    m_stub.reserve(len + 32);
    m_stub = name;
    m_stub += "::";

    event("begin");
    }

  ~process()
    {
    event("end");
    }

  void event(const char *name)
    {
    size_t len = m_stub.size();
    m_stub += name;

    m_ctx->event(m_stub.data());

    m_stub.resize(len);
    }

private:
  std::string m_stub;
  context *m_ctx;
  };

class block
  {
public:
  block(context *ctx, const char *name) : m_process(ctx, name) { }

private:
  process m_process;
  };

}
