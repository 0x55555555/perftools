#include "perf_identity.hpp"
#include "perf_config.hpp"
#include <cstdlib>
#include <iostream>
#include <thread>

#if defined(_WIN32)
# include <Windows.h>
#elif defined(__APPLE__)
# include <sys/sysctl.h>
# include <cpuid.h>

uint64_t get_64_bit_int(const char *id)
  {
  uint64_t val = 0;
  size_t size = sizeof(val);
  sysctlbyname(id, &val, &size, NULL, 0);

  return val;
  }

void append_string(perf_short_string &str, const char *id)
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

#endif

bool perf_identity::check(const perf_identity *i)
  {
  return true;
  }

perf_identity::perf_identity(const char *binding, perf_config *c)
  : m_config(c)
  {
  assert(c);
  assert(binding);
  }

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
  __cpuid(out, i);
#else
  __get_cpuid(i, out, out+1, out+2, out+3);
#endif
  }

void perf_identity::init()
  {
  // todo: tidy up,this is a bit messy, and not really the good information?
#if defined(_WIN32)
#if defined(_WIN64)
  m_os = "win32";
#else
  m_os = "win64";
#endif
  SYSTEM_INFO sysInfo;
  GetSystemInfo(&sysInfo);
  m_cpu_count = sysInfo.dwNumberOfProcessors;

  MEMORYSTATUSEX statex;
  statex.dwLength = sizeof (statex);
  GlobalMemoryStatusEx(&statex);
  m_memory_bytes = statex.ullTotalPhys;

#elif defined(__APPLE__)
  m_cpu_hz = get_64_bit_int("hw.cpufrequency");

  append_string(m_os, "kern.ostype");
  append(m_os, " ");
  append_string(m_os, "kern.osrelease");

  m_cpu_count = get_64_bit_int("hw.physicalcpu");
  m_memory_bytes = get_64_bit_int("hw.memsize");
  m_thread_count = std::thread::hardware_concurrency();

  append_string(m_arch, "hw.machine");
  append_string(m_arch, "hw.machine_arch");
  append_string(m_extra, "hw.model");

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
  auto id_count = cpuid_max();
  auto base = 0x80000002;
  auto required = 2;
  if ((id_count-base) >= required)
    {
    for (std::size_t i = 0; i <= required; ++i)
      {
      cpuid(base + i, reinterpret_cast<unsigned int *>(m_cpu.data() + (i * 16)));
      }
    }
  m_cpu.resize(48);
#else
  
  append(m_cpu, "unknown");
#endif
  }

void perf_identity::append_identity(perf_string& id, const char* tab) const
  {
  append(id, tab, "{\n");
  append(id, tab, "  \"arch\": \"", m_arch, "\",\n");
  append(id, tab, "  \"os\": \"", m_os, "\",\n");
  append(id, tab, "  \"cpu\": \"", m_cpu, "\",\n");
  append(id, tab, "  \"cpu_count\": ", m_cpu_count, ",\n");
  append(id, tab, "  \"thread_count\": ", m_thread_count, ",\n");
  append(id, tab, "  \"cpu_speed\": ", m_cpu_hz, ",\n");
  append(id, tab, "  \"extra\": \"", m_extra, "\",\n");
  append(id, tab, "  \"memory_bytes\": ", m_memory_bytes, ",\n");
  append(id, tab, "  \"binding\": \"", m_binding, "\"\n");
  append(id, tab, "}");
  }

const perf_string &perf_identity::get_identity() const
  {
  if (!m_identity)
    {
    m_identity = perf_string(m_config);

    append_identity(*m_identity, "");
    }

  return *m_identity;
  }
