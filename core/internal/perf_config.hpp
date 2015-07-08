#pragma once
#include "perf.h"
#include "perf_global.hpp"
#include "perf_identity.hpp"
#include "perf_allocator.hpp"
#include <cstdint>
#include <memory>
#include <atomic>
#include <cassert>

struct perf_config
  {
  static perf_config *init(
    perf_alloc alloc,
    perf_free free,
    const char *binding);
  static bool check(const perf_config *c);
  static void term(perf_config *c);

  perf_config(
      const char *binding,
      perf_alloc alloc,
      perf_free free);

  void add_context(perf_context *c);
  void remove_context(perf_context *c);

  template <typename T, typename... Args> T *create(Args &&...args)
    {
    return create<T, Args...>(m_alloc, std::forward<Args>(args)...);
    }

  template <typename T> void destroy(T *t)
    {
    return destroy<T>(m_free, t);
    }

  template <typename T, typename... Args> static T *create(
      perf_alloc alloc,
      Args &&...args)
    {
    void *ptr = alloc(sizeof(T));

    T *conf = new(ptr) T(std::forward<Args>(args)...);

    return conf;
    }

  template <typename T> static void destroy(perf_free free, T *t)
    {
    t->~T();
    free(t);
    }

  std::atomic<size_t> m_context_count;
  perf_alloc m_alloc;
  perf_free m_free;
  perf_identity m_identity;
  };

template <typename T> perf_allocator<T>::perf_allocator(perf_config *c)
    : m_alloc(c ? c->m_alloc : nullptr),
      m_free(c ? c->m_free : nullptr)
  {
  }
