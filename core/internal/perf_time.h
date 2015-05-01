#pragma once
#include <stdint.h>
#include "perf_allocator.h"

struct perf_relative_time
  {
public:
  void append_to(perf_string &str) const;

private:
  int64_t m_data;

  friend struct perf_absolute_time;
  };

struct perf_absolute_time
  {
  perf_absolute_time();

  /// Find the difference (this - t)
  perf_relative_time relative_to(const perf_absolute_time &t) const;

  void append_to(perf_string &str) const;

private:
  perf_absolute_time(const perf_absolute_time &);

  // seconds in [0], usecs in [1]
  uint64_t m_data[2];
  };

