#pragma once
#include "perf.h"
#include "perf_global.h"
#include "perf_identity.h"
#include "perf_allocator.h"
#include <stdint.h>
#include <memory>
#include <atomic>
#include <cassert>

struct perf_config
  {
  static perf_config *init(perf_alloc alloc, perf_free free);
  static bool check(const perf_config *c);
  static void term(perf_config *c);

  void addContext(perf_context *c);
  void removeContext(perf_context *c);

  template <typename T> T *create()
    {
    return create<T>(m_alloc);
    }

  template <typename T> void destroy(T *t)
    {
    return destroy<T>(m_free, t);
    }

  template <typename T> static T *create(perf_alloc alloc)
    {
    void *ptr = alloc(sizeof(perf_config));

    T *conf = new(ptr) T();

    return conf;
    }

  template <typename T> static void destroy(perf_free free, T *t)
    {
    t->~T();
    free(t);
    }

  std::atomic<size_t> m_contextCount;
  perf_alloc m_alloc;
  perf_free m_free;
  perf_identity m_identity;
  };

template <typename T> perf_allocator<T>::perf_allocator(perf_config *c)
    : m_alloc(c ? c->m_alloc : nullptr),
      m_free(c ? c->m_free : nullptr)
  {
  }
