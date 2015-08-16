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

#ifdef _DEBUG
#define PERF_ASSERT(x) perf::check(x)
#else
#define PERF_ASSERT(x)
#endif

/// \brief The Perf C++ api is all wrapped inside the namespace perf, except for a
/// couple of macros which all start with "PERF_"
/// \ingroup CPP_API
namespace perf
{

/// Utility method to check a value is true
/// \private
inline void check(bool b)
  {
  if (!b)
    {
    throw std::runtime_error("");
    }
  }

/// Utility method to check a pointer is valid
/// \private
template <typename T> inline void check(const T *b)
  {
  check(!!b);
  }

}
