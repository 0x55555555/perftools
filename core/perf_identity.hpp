#pragma once
#include "perf_global.hpp"
#include "perf_string.hpp"

namespace perf
{

class config;

/// \brief A descriptive class for a machines identity
/// Contains information about the performance statistics of the machine.
/// \ingroup CPP_API
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

  detail::short_string m_cpu;
  detail::short_string m_binding;
  detail::short_string m_arch;
  detail::short_string m_os;
  detail::short_string m_extra;
  std::size_t m_cpu_count;
  std::size_t m_thread_count;
  std::size_t m_cpu_hz;
  std::size_t m_memory_bytes;
  };

}
