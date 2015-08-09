#pragma once
#include "perf_global.hpp"
#include "perf_string.hpp"

namespace perf
{
  
class config;

/// A descriptive class for a machines identity
/// Contains information about the performance statistics of the machine.
class PERF_EXPORT identity
  {
public:
  /// Find the identity for the machine executing this code.
  static identity this_machine(perf::config *config, const char *binding);

  /// Get the machines description as json.
  void json_description(string &, const char *line_start="") const;
  
  /// Get the config that owns this identity.
  perf::config *config() const { return m_config; }
  
protected:
  identity() { }
  
  perf::config *m_config;

  short_string m_cpu;
  short_string m_binding;
  short_string m_arch;
  short_string m_os;
  short_string m_extra;
  std::size_t m_cpu_count;
  std::size_t m_thread_count;
  std::size_t m_cpu_hz;
  std::size_t m_memory_bytes;
  };

}
