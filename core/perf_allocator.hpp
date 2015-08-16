#pragma once
#include <cstddef>
#include <cstdlib>
#include <string>
#include "perf_global.hpp"

namespace perf {

/// \brief Untyped allocator class used inside perf
///
/// All allocations by perf use this API, enabling the user of perf to
/// ensure no memory allocations occur during profiling, if they choose.
/// \ingroup CPP_API
struct allocator_base
  {
  using alloc = void *(*)(size_t size);
  using free = void (*)(void *size);

  allocator_base()
  : allocator_base(std::malloc, std::free)
    {
    }

  allocator_base(alloc a, free f)
  : m_alloc(a)
  , m_free(f)
    {
    check(m_alloc);
    check(m_free);
    }

  bool operator==(const allocator_base &a) const
    {
    return a.m_alloc == m_alloc && a.m_free == m_free;
    }

  bool operator!=(const allocator_base &a) const
    {
    return !(*this == a);
    }

  template <typename T, typename... Args> T *allocate_and_construct(Args &&... args) const
    {
    auto mem = m_alloc(sizeof(T));
    return new(mem) T(std::forward<Args>(args)...);
    }

  template <typename T> void destroy_and_free(T *t) const
    {
    t->~T();
    m_free(t);
    }

protected:
  alloc m_alloc;
  free m_free;
  };

namespace detail {

/// \brief Implementation of std::allocator used for
/// allocating and returning all api and internal objects.
/// \note Follows the C++ standard API for allocators.
/// \ingroup CPP_API
template <typename T> struct allocator : public allocator_base
  {
  using value_type = T;
  using size_type = std::size_t;
  using pointer = T *;
  using const_pointer = const T *;

  /// \brief Rebind this allocator to a new type
  template <typename U> struct rebind
    {
    using other = allocator<U>;
    };

  allocator(const allocator_base &a) : allocator_base(a)
    {
    }

  /// Allocate [n] new object's (does not construct)
  /// \note Currently ignores [hint].
  pointer allocate(size_type n, const void *hint = nullptr)
    {
    (void)hint;
    check(m_alloc);
    auto mem = m_alloc(sizeof(T) * n);
    return reinterpret_cast<pointer>(mem);
    }

  /// Free [n] objects, residing at [p].
  /// \note [n] should be consistent with the [allocate] call.
  void deallocate(pointer p, size_type n)
    {
    (void)n;
    check(m_free);
    return m_free(p);
    }

  /// Construct the obhect at [p] with [args] as constructor arguments.
  template <class U, class... Args> void construct(U* p, Args&&... args)
    {
    ::new((void *)p) U(std::forward<Args>(args)...);
    }

  /// Call the destructor for [p].
  template <class U> void destroy(U* p)
    {
    (void)p;
    p->~U();
    }
  };

}

}
