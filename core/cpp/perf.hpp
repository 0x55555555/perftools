#pragma once
#include "perf.h"
#include <cstdlib>
#include <cstring>
#include <stdexcept>
#include <string>

namespace perf
{

class PERF_EXPORT identity
  {
public:
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
    if (!c || !name)
      {
      throw std::invalid_argument("Invalid argument to context");
      }

    m_ctx = perf_init_context(c->m_cfg, name);
    if (!m_ctx)
      {
      throw std::runtime_error("failed to initialise context");
      }
    }

  context(config &c, const char *name)
    : context(&c, name)
    {
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

class PERF_EXPORT meta_event
  {
public:
  meta_event(context *ctx, const char *name);
  meta_event(context &ctx, const char *name) : meta_event(&ctx, name)
    {
    }

  meta_event(meta_event *ev, const char *name);
  meta_event(meta_event &ev, const char *name) : meta_event(&ev, name)
    {
    }

  void begin();
  void end();

  void fire();
  };

class PERF_EXPORT event
  {
public:
  event(meta_event *meta);
  event(meta_event &meta) : event(&meta)
    {
    m_meta->begin();
    }

  event()
    {
    m_meta->end();
    }

  meta_event *meta() { return m_meta; }
  const meta_event *meta() const { return m_meta; }

private:
  meta_event *m_meta;
  };

class PERF_EXPORT single_fire_event : public meta_event, public event
  {
public:
  single_fire_event(context *ctx, const char *name) : meta_event(ctx, name), event(this)
    {
    }

  single_fire_event(context &ctx, const char *name) : single_fire_event(&ctx, name)
    {
    }

  single_fire_event(event *evt, const char *name) : meta_event(evt->meta(), name), event(this)
    {
    }

  single_fire_event(event &evt, const char *name) : single_fire_event(&evt, name)
    {
    }

  void fire(const char *name)
    {
    perf::meta_event temp(this, name);
    temp.fire();
    }
  };

}
