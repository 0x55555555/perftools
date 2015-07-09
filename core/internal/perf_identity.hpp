#pragma once
#include "perf.h"
#include "perf_string.hpp"

/// Describes a machine which profiling runs on.
struct perf_identity
  {
  /// Check this identity is valid, used in api check functions
  static bool check(const perf_identity *c);

  /// Create an identiy given a binding name, and a config to allocate with
  perf_identity(const char *binding, perf_config *);
  
  perf_identity(const perf_identity &) = delete;

  /// Initialise the identity from the current machine specs
  void init();
  /// Append a description of this identity to [s].
  void append_identity(perf_string& s, const char* tab);
  /// Calculate m_identity which can be returned to callers through api.
  void calculate_identity(perf_config *c);

  perf_string m_identity;

  perf_string m_cpu;
  size_t m_cpu_count;
  size_t m_memory_bytes;
  perf_string m_binding;
  perf_string m_os;
  perf_string m_os_detail;

  perf_config *m_config;
  };
