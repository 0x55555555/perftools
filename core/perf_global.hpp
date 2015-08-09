#pragma once
#include <stdexcept>

#ifdef _WIN32
# ifdef PERF_BUILD
#  define PERF_EXPORT __declspec(dllexport)
# else
#  define PERF_EXPORT __declspec(dllimport)
# endif
#else
# define PERF_EXPORT
#endif

namespace perf
{

inline void check(bool b)
  {
  if (!b)
    {
    throw std::runtime_error("");
    }
  }

template <typename T> inline void check(const T *b)
  {
  check(!!b);
  }

}

#ifdef _DEBUG
#define perf_assert(x) perf::check(x)
#else
#define perf_assert(x)
#endif
