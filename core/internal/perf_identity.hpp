#pragma once
#include "perf.h"
#include "perf_string.hpp"
#include <experimental/optional>

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
  void append_identity(perf_string& s, const char* tab) const;

  const perf_string &get_identity() const;

private:
  mutable std::experimental::optional<perf_string> m_identity;

  perf_short_string m_cpu;
  std::size_t m_cpu_count;
  std::size_t m_thread_count;
  std::size_t m_cpu_hz;
  std::size_t m_memory_bytes;
  perf_short_string m_binding;
  perf_short_string m_arch;
  perf_short_string m_os;
  perf_short_string m_extra;

  perf_config *m_config;
  };
