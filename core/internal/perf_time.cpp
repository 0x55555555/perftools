#include "perf_time.hpp"


void perf_relative_time::append_to(perf_string &str) const
  {
  char data[32];
  snprintf(data, sizeof(data)/sizeof(char), "%llu", (std::uint64_t)m_data.count());
  str += data;
  }

perf_absolute_time perf_absolute_time::now()
  {
  perf_absolute_time ret;

  ret.m_data = std::chrono::high_resolution_clock::now();

  return ret;
  }

perf_relative_time perf_absolute_time::relative_to(const perf_absolute_time &t) const
  {
  perf_relative_time rel;

  rel.m_data = m_data - t.m_data;

  return rel;
  }

void perf_absolute_time::append_to(perf_string &str) const
{
  char data[32];
  snprintf(data, sizeof(data)/sizeof(char), "%llu", (std::uint64_t)m_data.time_since_epoch().count());
  str += data;
  }

