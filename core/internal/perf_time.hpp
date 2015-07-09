#pragma once
#include "perf_string.hpp"
#include <chrono>

/// A relative
struct perf_relative_time
  {
public:
  void append_to(perf_string &str) const;

private:
  std::chrono::nanoseconds m_data;

  friend struct perf_absolute_time;
  };

struct perf_absolute_time
  {
  /// Find an absolute time from the current time.
  static perf_absolute_time now()
    {
    perf_absolute_time ret;
    ret.m_data = std::chrono::high_resolution_clock::now();
    return ret;
    }

  perf_absolute_time(const perf_absolute_time &) = default;
  perf_absolute_time &operator=(const perf_absolute_time &) = default;

  /// Find the difference (this - t)
  perf_relative_time relative_to(const perf_absolute_time &t) const
    {
    perf_relative_time rel;

    rel.m_data = m_data - t.m_data;

    return rel;
    }

  void append_to(perf_string &str) const;

private:
  perf_absolute_time() {}

  std::chrono::high_resolution_clock::time_point m_data;
  };

