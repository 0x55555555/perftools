#pragma once
#include <stdexcept>

#define PERF_EXPORT

namespace perf
{

template <typename T> void ptr_check(T *t)
  {
  if (!t)
    {
    throw std::runtime_error("");
    }
  }

template <typename T> void check(T *t)
  {
  perf_ptr_check(t);

  if (!T::check(t))
    {
    throw std::runtime_error("");
    }
  }

inline void check(bool b)
  {
  if (!b)
    {
    throw std::runtime_error("");
    }
  }

}

#ifdef _DEBUG
#define perf_assert(x) perf::check(x)
#else
#define perf_assert(x)
#endif
