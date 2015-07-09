#include "perf.h"
#include "perf_config.hpp"
#include "perf_context.hpp"
#include <cstdlib>

namespace 
{
void perf_handle_api_error()
  {

  }
}

#define API_CHECK(fn) try { return fn(); } catch(...) { perf_handle_api_error(); }

perf_config *perf_init_default_config(const char *binding)
  {
  return perf_init_config(malloc, free, binding);
  }

perf_config *perf_init_config(perf_alloc alloc, perf_free free, const char *binding)
  {
  API_CHECK([&]()
    {
    return perf_config::init(alloc, free, binding);
    });

  return nullptr;
  }

void perf_term_config(perf_config *cfg)
  {
  API_CHECK([&]()
    {
    perf_config::term(cfg);
    });
  }

const perf_identity *perf_find_identity(perf_config *cfg)
  {
  API_CHECK([&]()
    {
    perf_check(cfg);

    return &cfg->m_identity;
    });

  return nullptr;
  }

const char *perf_identity_description(const perf_identity *id)
  {
  API_CHECK([&]()
    {
    perf_check(id);

    return id->m_identity.c_str();
    });

  return nullptr;
  }

perf_error perf_check_error(perf_context *ctx)
  {
  API_CHECK([&]()
    {
    perf_check(ctx);

    return ctx->error();
    });

  return perf_error_in_error;
  }

perf_context *perf_init_context(perf_config *cfg, const char *name)
  {
  API_CHECK([&]()
    {
    return perf_context::init(cfg, name);
    });

  return nullptr;
  }

void perf_term_context(perf_context *ctx)
  {
  API_CHECK([&]()
    {
    perf_context::term(ctx);
    });
  }

void perf_write_context(perf_context *ctx, const char *name)
  {
  API_CHECK([&]()
    {
    perf_context::write(ctx, name);
    });
  }

const char *perf_dump_context(perf_context *ctx)
  {
  API_CHECK([&]()
    {
    return perf_context::dump(ctx);
    });

  return nullptr;
  }

void perf_add_event(perf_context *ctx, const char *name)
  {
  API_CHECK([&]()
    {
    perf_context::add(ctx, name);
    });
  }
