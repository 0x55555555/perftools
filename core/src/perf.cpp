#include "perf.h"
#include "perf.hpp"
#include <cstdlib>

namespace
{
void perf_handle_api_error()
  {

  }

template <typename T, typename X> T *unwrap(X *x)
  {
  T *unwrapped = (T*)x;
  perf::check(unwrapped);

  return unwrapped;
  }

template <typename T, typename X> T *wrap(X *x)
  {
  return (T*)x;
  }

template <typename T, typename X> T *wrap(X &x)
  {
  return (T*)&x;
  }

template <typename T, typename X> const T *wrap(const X *x)
  {
  return (T*)x;
  }

template <typename T, typename X> const T *wrap(const X &x)
  {
  return (T*)&x;
  }

}

#define API_CHECK(fn) try { return fn(); } catch(...) { perf_handle_api_error(); }

perf_config *perf_init_default_config(const char *binding)
  {
  return perf_init_config(malloc, free, binding);
  }

perf_config *perf_init_config(perf_alloc alloc, perf_free free, const char *binding)
  {
  API_CHECK([&]() -> perf_config *
    {
    auto allocator = perf::allocator_base(alloc, free);

    return wrap<perf_config>(allocator.allocate_and_construct<perf::config>(binding, allocator));
    });

  return nullptr;
  }

void perf_term_config(perf_config *cfg)
  {
  API_CHECK([&]()
    {
    auto config = unwrap<perf::config>(cfg);
    auto alloc = config->allocator();
    alloc.destroy_and_free(config);
    });
  }

const perf_identity *perf_find_identity(perf_config *cfg)
  {
  API_CHECK([&]() -> const perf_identity *
    {
    auto config = unwrap<perf::config>(cfg);

    return wrap<perf_identity>(config->get_identity());
    });

  return nullptr;
  }

const char *perf_identity_description(const perf_identity *id)
  {
  API_CHECK([&]() -> const char *
    {
    auto identity = unwrap<perf::identity>(id);

    static perf::string output(identity->config()->allocator());
    output.clear();

    identity->json_description(output, "");

    return output.c_str();
    });

  return nullptr;
  }

perf_context *perf_init_context(perf_config *cfg, const char *name)
  {
  API_CHECK([&]() -> perf_context *
    {
    auto config = unwrap<perf::config>(cfg);
    return wrap<perf_context>(config->allocator().allocate_and_construct<perf::context>(config, name));
    });

  return nullptr;
  }

void perf_term_context(perf_context *ctx)
  {
  API_CHECK([&]()
    {
    auto context = unwrap<perf::context>(ctx);
    auto config = context->get_config();

    config->allocator().destroy_and_free(context);
    });
  }

void perf_write_context(perf_context *ctx, const char *name)
  {
  API_CHECK([&]()
    {
    auto context = unwrap<perf::context>(ctx);

    perf::json_writer writer;

    writer.write(*context, name);
    });
  }

const char *perf_dump_context(perf_context *ctx)
  {
  API_CHECK([&]() -> const char *
    {
    auto context = unwrap<perf::context>(ctx);

    perf::json_writer writer;

    auto out = writer.dump(*context);
    static perf::string cached(context->get_config()->allocator());

    cached = out;
    return cached.c_str();
    });

  return nullptr;
  }

void perf_add_event(perf_context *ctx, const char *name)
  {
  API_CHECK([&]()
    {
    auto context = unwrap<perf::context>(ctx);

    perf::single_fire_event(context, name);
    });
  }

perf_meta_event *perf_init_meta_event(perf_context *ctx, const char *name)
  {
  API_CHECK([&]() -> perf_meta_event *
    {
    auto context = unwrap<perf::context>(ctx);

    auto &allocator = context->get_config()->allocator();
    return wrap<perf_meta_event>(allocator.allocate_and_construct<perf::meta_event>(context, name));
    });

  return nullptr;
  }

void perf_term_meta_event(perf_meta_event *ev)
  {
  API_CHECK([&]()
    {
    auto event = unwrap<perf::meta_event>(ev);
    auto config = event->get_context()->get_config();

    config->allocator().destroy_and_free(event);
    });
  }

perf_event *perf_init_event(perf_meta_event *meta)
  {
  API_CHECK([&]() -> perf_event *
    {
    auto meta_event = unwrap<perf::meta_event>(meta);

    auto context = meta_event->get_context();
    
    auto &allocator = context->get_config()->allocator();
    return wrap<perf_event>(allocator.allocate_and_construct<perf::event>(&context->root_event(), meta_event));
    });

  return nullptr;
  }

void perf_term_event(perf_event *ev)
  {
  API_CHECK([&]()
    {
    auto event = unwrap<perf::event>(ev);
    auto config = event->get_meta_event()->get_context()->get_config();

    config->allocator().destroy_and_free(event);
    });
  }
