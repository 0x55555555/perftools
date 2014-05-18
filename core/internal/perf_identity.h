#pragma once
#include <string>

struct perf_identity
  {
  static bool check(const perf_identity *c);

  perf_identity();

  void calculateIdentity();

  std::string m_identity;

  std::string m_cpu;
  size_t m_cpuCount;
  size_t m_memoryBytes;

private:
  perf_identity(const perf_identity &);
  };
