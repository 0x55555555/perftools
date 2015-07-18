#pragma once
#include <cstddef>
#include <string>
#include "perf_global.hpp"

namespace perf {

struct allocator_base
  {
  using alloc = void *(*)(size_t size);
  using free = void (*)(void *size);


  bool operator!=(const allocator_base &a) const
    {
    return a.m_alloc != m_alloc || a.m_free != m_free;
    }

protected:
  alloc m_alloc;
  free m_free;
  };

/// Implementation of std::allocator used for
/// allocating and returning all api and internal objects
template <typename T> struct allocator final : public allocator_base
  {
  using value_type = T;
  using size_type = std::size_t;
  using pointer = T *;
  using const_pointer = const T *;

  allocator(const allocator_base &);
  allocator(alloc a, free f);

  pointer allocate(size_type n, const void *hint = nullptr)
    {
    (void)hint;
    ptr_check(m_alloc);
    return reinterpret_cast<pointer>(m_alloc(sizeof(T) * n));
    }

  void deallocate(pointer p, size_type n)
    {
    (void)n;
    ptr_check(m_free);
    return m_free(p);
    }
  };

}
