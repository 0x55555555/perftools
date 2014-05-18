#pragma once
#include <stdint.h>

struct perf_relative_time
  {
private:
  int64_t m_data;

  friend struct perf_absolute_time;
  };

struct perf_absolute_time
  {
  perf_absolute_time();

  /// Find the difference (this - t)
  perf_relative_time relativeTo(const perf_absolute_time &t) const;

private:
  perf_absolute_time(const perf_absolute_time &);

  uint64_t m_data[2];
  };

