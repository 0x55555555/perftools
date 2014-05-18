#pragma once
#include "perf.h"
#include "perf_allocator.h"

struct perf_identity
  {
  static bool check(const perf_identity *c);

  perf_identity();

  void init(perf_config *);
  void calculateIdentity(perf_config *c);

  perf_string m_identity;

  perf_string m_cpu;
  size_t m_cpuCount;
  size_t m_memoryBytes;

private:
  perf_identity(const perf_identity &);
  };
