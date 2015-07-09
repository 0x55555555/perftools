#include "perf_identity.hpp"
#include "perf_config.hpp"
#include <cstdlib>
#include <iostream>

#if defined(_WIN32)
# include <Windows.h>
#elif defined(__APPLE__)
# include <sys/sysctl.h>

bool perf_identity::check(const perf_identity *i)
  {
  return i != 0;
  }

uint64_t get_64_bit_int(const char *id)
  {
  uint64_t val = 0;
  size_t size = sizeof(val);
  sysctlbyname(id, &val, &size, NULL, 0);

  return val;
  }

void append_string(perf_string &str, const char *id)
  {
  std::size_t len = 0;
  sysctlbyname(id, NULL, &len, NULL, 0);
  if (!len)
    {
    return;
    }

  std::size_t old_size = str.size();
  str.resize(old_size + len);
  sysctlbyname(id, &str[0] + old_size, &len, NULL, 0);
  str.resize(old_size + len - 1);
  }

#endif

perf_identity::perf_identity(const char *binding, perf_config *c)
  : m_cpu(c),
    m_binding(binding, c),
    m_os(c),
    m_os_detail(c),
    m_config(c)
  {
  assert(c);
  assert(binding);
  }

void perf_identity::init()
  {
#if defined(_WIN32)
#if defined(_WIN64)
  m_os = "win32";
#else
  m_os = "win64";
#endif
  m_os_detail = "windows";

  int CPUInfo[4] = {-1};
  unsigned   nExIds, i =  0;
  char CPUBrandString[0x40];
  // Get the information associated with each extended ID.
  __cpuid(CPUInfo, 0x80000000);
  nExIds = CPUInfo[0];
  for (i=0x80000000; i<=nExIds; ++i)
  {
    __cpuid(CPUInfo, i);
    // Interpret CPU brand string
    if  (i == 0x80000002)
      memcpy(CPUBrandString, CPUInfo, sizeof(CPUInfo));
    else if  (i == 0x80000003)
      memcpy(CPUBrandString + 16, CPUInfo, sizeof(CPUInfo));
    else if  (i == 0x80000004)
      memcpy(CPUBrandString + 32, CPUInfo, sizeof(CPUInfo));
  }
  // string includes manufacturer, model and clockspeed
  m_cpu = CPUBrandString;


  SYSTEM_INFO sysInfo;
  GetSystemInfo(&sysInfo);
  m_cpu_count = sysInfo.dwNumberOfProcessors;

  MEMORYSTATUSEX statex;
  statex.dwLength = sizeof (statex);
  GlobalMemoryStatusEx(&statex);
  m_memory_bytes = statex.ullTotalPhys;
#elif defined(__APPLE__)
  m_os = "osx";

  uint64_t freq = get_64_bit_int("hw.cpufrequency");
  append_string(m_cpu, "hw.machine");
  append(m_cpu, ", ");
  append_string(m_cpu, "hw.model");
  append(m_cpu, ", ");
  append_string(m_cpu, "hw.machine_arch");
  append(m_cpu, ", ", freq, " hz");

  append_string(m_os_detail, "kern.osrelease");
  append(m_os_detail, ", ");
  append_string(m_os_detail, "kern.ostype");

  m_cpu_count = get_64_bit_int("hw.physicalcpu");
  m_memory_bytes = get_64_bit_int("hw.memsize");
#else
  m_os = "undefined";
  m_cpu = "unknown";
  m_cpuCount = 0;
  m_memoryBytes = 0;
# error platform undefined
#endif

  calculate_identity(m_config);
  }

void perf_identity::calculate_identity(perf_config *c)
  {
  m_identity.~perf_string();
  new(&m_identity) perf_string(c);

  append_identity(m_identity, "");
  }

void perf_identity::append_identity(perf_string& id, const char* tab)
  {
  append(id, tab, "{\n");
  append(id, tab, "  \"os\": \"", m_os, "\",\n");
  append(id, tab, "  \"os_detail\": \"", m_os_detail, "\",\n");
  append(id, tab, "  \"cpu\": \"", m_cpu, "\",\n");
  append(id, tab, "  \"cpu_count\": \"", m_cpu_count, "\",\n");
  append(id, tab, "  \"memory_bytes\": \"", m_memory_bytes, "\",\n");
  append(id, tab, "  \"binding\": \"", m_binding, "\"\n");
  append(id, tab, "}");
  }
