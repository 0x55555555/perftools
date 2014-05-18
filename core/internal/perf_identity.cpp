#include "perf_identity.h"
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

std::string getString(const char *id)
  {
  std::size_t len = 0;
  sysctlbyname(id, NULL, &len, NULL, 0);
  if (!len)
    {
    return std::string();
    }

  std::unique_ptr<char, void(*)(void*)> data((char*)malloc(len*sizeof(char)), std::free);
  sysctlbyname(id, data.get(), &len, NULL, 0);

  return data.get();
  }

#endif

perf_identity::perf_identity()
  {
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

  m_cpu = getString("hw.machine") + ", " +
          getString("hw.model") + ", " +
          std::to_string(get64BitInt("hw.cpufrequency")) + "hz";


  m_cpuCount = get64BitInt("hw.physicalcpu");
  m_memoryBytes = get64BitInt("hw.memsize");

#endif

  calculateIdentity();
  }

void perf_identity::calculateIdentity()
  {
  m_identity = "{\n  \"cpu\": \"" + m_cpu + "\",\n"
               "  \"cpuCount\": \"" + std::to_string(m_cpuCount) + "\",\n"
               "  \"memoryBytes\": \"" + std::to_string(m_memoryBytes) +
               "\"\n}";
  }
