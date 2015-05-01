#pragma once
#include "perf.h"
#include "perf_allocator.h"

struct perf_identity
  {
  static bool check(const perf_identity *c);

  perf_identity(const char *name, perf_config *);

  void init();
  void append_identity(perf_string& s, const char* tab);
  void calculate_identity(perf_config *c);

  perf_string m_identity;

  perf_string m_cpu;
  size_t m_cpu_count;
  size_t m_memory_bytes;
  perf_string m_binding;
  perf_string m_os;
  perf_string m_os_detail;

  perf_config *m_config;

private:
  perf_identity(const perf_identity &);
  };
