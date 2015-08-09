#pragma once
#include <chrono>
#include <cstdint>

namespace perf
{

/// A time point in the current system, relative to some unknown clock.
class time
  {
public:
  /// Find a time point for now.
  static time now()
    {
    time t;
    t.m_time = std::chrono::high_resolution_clock::now();
    return t;
    }

  /// Find a nanosecond value, by finding the relative time between two time points.
  std::chrono::nanoseconds operator-(const time &t) const
    {
    return m_time - t.m_time;
    }

  /// Find the time since the epoch in nanoseconds
  std::uint64_t count() const
    {
    return std::chrono::duration_cast<std::chrono::nanoseconds>(m_time.time_since_epoch()).count();
    }

private:
  std::chrono::high_resolution_clock::time_point m_time;
  };

}
