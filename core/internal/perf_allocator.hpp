#pragma once
#include "perf.h"
#include <cstddef>
#include <string>
#include <cassert>

struct perf_config;

/// Implementation of std::allocator used for
/// allocating and returning all api and internal objects
template <typename T> struct perf_allocator
  {
  using value_type = T;
  using size_type = std::size_t;
  using pointer = T *;
  using const_pointer = const T *;

  perf_allocator(perf_config *c=nullptr);

  pointer allocate(size_type n, const void *hint = nullptr)
    {
    (void)hint;
    assert(m_alloc);
    return reinterpret_cast<pointer>(m_alloc(sizeof(T) * n));
    }

  void deallocate(pointer p, size_type n)
    {
    (void)n;
    assert(m_free);
    return m_free(p);
    }

  bool operator!=(const perf_allocator &a) const
    {
    return a.m_alloc != m_alloc || a.m_free != m_free;
    }

  perf_alloc m_alloc;
  perf_free m_free;
  };
