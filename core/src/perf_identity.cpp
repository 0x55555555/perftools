#include "perf_identity.hpp"
#include <thread>

#if defined(_WIN32)
# include <Windows.h>
#elif defined(__APPLE__)
# include <sys/sysctl.h>
# include <cpuid.h>

namespace
{

// osx sysctlbyname integer
uint64_t get_64_bit_int(const char *id)
  {
  uint64_t val = 0;
  size_t size = sizeof(val);
  sysctlbyname(id, &val, &size, NULL, 0);

  return val;
  }

// osx sysctlbyname string
  void append_string(perf::short_string &str, const char *id)
  {
  std::size_t len = 0;
  sysctlbyname(id, NULL, &len, NULL, 0);
  if (!len)
    {
    return;
    }

  std::size_t old_size = str.size();
  len = std::min(len, str.capacity() - old_size);
  sysctlbyname(id, &str[0] + old_size, &len, NULL, 0);
  }

}

#endif

namespace
{

/// x86 and x64 cpuid instructions
#if defined(PERF_X86) || defined(PERF_X64)
int cpuid_max()
  {
#ifdef _WIN32
  int id[4] = { -1 };
  __cpuid(id, 0x80000000);
  return id[0];
#else
  unsigned int sig = 0;
  return __get_cpuid_max(0x80000000, &sig);
#endif
  }

void cpuid(unsigned int i, unsigned int *out)
  {
#ifdef _WIN32
  __cpuid((int*)out, i);
#else
  __get_cpuid(i, out, out+1, out+2, out+3);
#endif
  }
#endif

}

namespace perf
{

identity identity::this_machine(perf::config *config, const char *binding)
  {
  identity id;
  id.m_config = config;

  check(binding);
  append(id.m_binding, binding);

  // todo: tidy up,this is a bit messy, and not really the good information?
#if defined(_WIN32)
#if defined(_WIN64)
  id.m_os = "win64";
#else
  id.m_os = "win32";
#endif
  SYSTEM_INFO sysInfo;
  GetSystemInfo(&sysInfo);
  id.m_cpu_count = sysInfo.dwNumberOfProcessors;

  MEMORYSTATUSEX statex;
  statex.dwLength = sizeof (statex);
  GlobalMemoryStatusEx(&statex);
  id.m_memory_bytes = statex.ullTotalPhys;

#elif defined(__APPLE__)
  id.m_cpu_hz = get_64_bit_int("hw.cpufrequency");

  append_string(id.m_os, "kern.ostype");
  append(id.m_os, " ");
  append_string(id.m_os, "kern.osrelease");

  id.m_cpu_count = get_64_bit_int("hw.physicalcpu");
  id.m_memory_bytes = get_64_bit_int("hw.memsize");
  id.m_thread_count = std::thread::hardware_concurrency();

  append_string(id.m_arch, "hw.machine");
  append_string(id.m_arch, "hw.machine_arch");
  append_string(id.m_extra, "hw.model");

#else
  set(m_os, "undefined");
  set(m_extra, "");
  set(m_arch, "");
  m_cpu_count = 0;
  m_cpu_hz = 0;
  m_memory_bytes = 0;
# error platform undefined
#endif

#if defined(PERF_X86) || defined(PERF_X64)
  uint32_t id_count = cpuid_max();
  uint32_t base = 0x80000002;
  uint32_t required = 2;
  if ((id_count-base) >= required)
    {
    for (uint32_t i = 0; i <= required; ++i)
      {
      char *data = id.m_cpu.data() + (i * 16);
      cpuid(base + i, reinterpret_cast<unsigned int *>(data));
      }
    }
  id.m_cpu.resize(48);
#else

  append(m_cpu, "unknown");
#endif

  return id;
  }

void identity::json_description(string& id, const char* line_start) const
  {
  append(id, line_start, "{\n");
  append(id, line_start, "  \"arch\": \"", m_arch, "\",\n");
  append(id, line_start, "  \"os\": \"", m_os, "\",\n");
  append(id, line_start, "  \"cpu\": \"", m_cpu, "\",\n");
  append(id, line_start, "  \"cpu_count\": ", m_cpu_count, ",\n");
  append(id, line_start, "  \"thread_count\": ", m_thread_count, ",\n");
  append(id, line_start, "  \"cpu_speed\": ", m_cpu_hz, ",\n");
  append(id, line_start, "  \"extra\": \"", m_extra, "\",\n");
  append(id, line_start, "  \"memory_bytes\": ", m_memory_bytes, ",\n");
  append(id, line_start, "  \"binding\": \"", m_binding, "\"\n");
  append(id, line_start, "}");
  }

}
