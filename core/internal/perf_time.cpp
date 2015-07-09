#include "perf_time.hpp"

void perf_relative_time::append_to(perf_string &str) const
  {
  append(str, (std::uint64_t)m_data.count());
  }

void perf_absolute_time::append_to(perf_string &str) const
  {
  append(str, (std::uint64_t)m_data.time_since_epoch().count());
  }

