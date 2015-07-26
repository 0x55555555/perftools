#pragma once
#include <stdexcept>

#define PERF_EXPORT

namespace perf
{

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
