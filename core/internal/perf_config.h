#pragma once
#include "perf.h"
#include "perf_global.h"
#include "perf_identity.h"
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

template <typename T> struct perf_allocator
  {
  typedef T value_type;
  typedef std::size_t size_type;
  typedef T *pointer;
  typedef const T *const_pointer;

  perf_allocator(perf_config *c=nullptr)
      : m_config(c)
    {
    }

  pointer allocate(size_type n, const void *hint = nullptr)
    {
    (void)hint;
    assert(m_config);
    return reinterpret_cast<pointer>(m_config->m_alloc(sizeof(T) * n));
    }

  void deallocate (pointer p, size_type n)
    {
    (void)n;
    assert(m_config);
    return m_config->m_free(p);
    }

  bool operator!=(const perf_allocator &a) const
    {
    return a.m_config != m_config;
    }

  perf_config *m_config;
  };
