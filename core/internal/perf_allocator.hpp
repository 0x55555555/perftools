#pragma once
#include "perf.h"
#include <cstddef>
#include <string>
#include <cassert>

struct perf_config;

template <typename T> struct perf_allocator
  {
  typedef T value_type;
  typedef std::size_t size_type;
  typedef T *pointer;
  typedef const T *const_pointer;

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

typedef std::basic_string<char, std::char_traits<char>, perf_allocator<char> > perf_string;
