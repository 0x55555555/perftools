#include "perf_identity.h"
#include "perf_config.h"
#include <cstdlib>
#include <memory>

bool perf_identity::check(const perf_identity *i)
  {
  return i != 0;
  }

#if defined(_WIN32)
# include <Windows.h>
#elif defined(__APPLE__)
# include <sys/sysctl.h>

uint64_t get64BitInt(const char *id)
  {
  uint64_t val = 0;
  size_t size = sizeof(val);
  sysctlbyname(id, &val, &size, NULL, 0);

  return val;
  }

perf_string getString(perf_config *c, const char *id)
  {
  std::size_t len = 0;
  sysctlbyname(id, NULL, &len, NULL, 0);
  if (!len)
    {
    return perf_string(c);
    }

  std::unique_ptr<char, void(*)(void*)> data((char*)c->m_alloc(len*sizeof(char)), c->m_free);
  sysctlbyname(id, data.get(), &len, NULL, 0);

  assert(c);
  return perf_string(data.get(), c);
  }

#endif

perf_identity::perf_identity()
  {
  }

void perf_identity::init(perf_config *c)
  {
  assert(c);

#if defined(_WIN32)
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
  m_cpuCount = sysInfo.dwNumberOfProcessors;

  MEMORYSTATUSEX statex;
  statex.dwLength = sizeof (statex);
  GlobalMemoryStatusEx(&statex);
  m_memoryBytes = statex.ullTotalPhys;
#elif defined(__APPLE__)

  const std::size_t size = 1024;
  m_cpu.~perf_string();
  new(&m_cpu) perf_string(c);
  m_cpu.resize(size);

  uint64_t freq = get64BitInt("hw.cpufrequency");
  auto machine = getString(c, "hw.machine");
  auto model = getString(c, "hw.model");

  int printed = snprintf(
                  &m_cpu[0],
                  size/sizeof(char),
                  "%s, %s, %llu hz",
                  machine.data(),
                  model.data(),
                  (uint64_t)freq);
  m_cpu.resize(printed);

  m_cpuCount = get64BitInt("hw.physicalcpu");
  m_memoryBytes = get64BitInt("hw.memsize");
#else
# error platform undefined
#endif

  calculateIdentity(c);
  }

void perf_identity::calculateIdentity(perf_config *c)
  {
  const std::size_t size = 1024;
  m_identity.~perf_string();
  new(&m_identity) perf_string(c);
  m_identity.resize(size);

  int printed = snprintf(
                  &m_identity[0],
                  size/sizeof(char),
                  "{\n"
                  "  \"cpu\": \"%s\",\n"
                  "  \"cpuCount\": \"%llu\",\n"
                  "  \"memoryBytes\": \"%llu\"\n"
                  "}\n",
                  m_cpu.data(),
                  (uint64_t)m_cpuCount,
                  (uint64_t)m_memoryBytes);
  m_identity.resize(printed);
  }
