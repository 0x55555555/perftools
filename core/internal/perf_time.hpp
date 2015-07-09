#pragma once
#include "perf_string.hpp"
#include <chrono>

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
  static perf_absolute_time now();

  perf_absolute_time(const perf_absolute_time &) = default;
  perf_absolute_time &operator=(const perf_absolute_time &) = default;

  /// Find the difference (this - t)
  perf_relative_time relative_to(const perf_absolute_time &t) const;

  void append_to(perf_string &str) const;

private:
  perf_absolute_time() {}

  std::chrono::high_resolution_clock::time_point m_data;
  };

