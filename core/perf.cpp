#include "perf.h"
#include "perf_config.h"
#include "perf_context.h"
#include <cstdlib>

extern "C"
{

perf_config *perf_init_default_config()
  {
  return perf_init_config(malloc, free);
  }

perf_config *perf_init_config(perf_alloc alloc, perf_free free)
  {
  return perf_config::init(alloc, free);
  }

void perf_term_config(perf_config *cfg)
  {
  perf_config::term(cfg);
  }

const perf_identity *perf_find_identity(perf_config *cfg)
  {
  if (!perf_config::check(cfg))
    {
    return nullptr;
    }

  return &cfg->m_identity;
  }

const char *perf_identity_description(const perf_identity *id)
  {
  if (!perf_identity::check(id))
    {
    return "";
    }

  return id->m_identity.c_str();
  }

perf_error perf_check_error(perf_context *ctx)
  {
  if (!perf_context::check(ctx))
    {
    return perf_error_in_error;
    }

  return ctx->error();
  }

perf_context *perf_init_context(perf_config *cfg)
  {
  return perf_context::init(cfg);
  }

void perf_term_context(perf_context *ctx)
  {
  return perf_context::term(ctx);
  }

void perf_write_context(perf_context *ctx, const char *name)
  {
  return perf_context::write(ctx, name);
  }

const char *perf_dump_context(perf_context *ctx)
  {
  return perf_context::dump(ctx);
  }

void perf_add_event(perf_context *ctx, const char *name)
  {
  return perf_context::add(ctx, name);
  }
}
