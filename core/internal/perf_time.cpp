#include "perf_time.h"

#if defined(__APPLE__)
# include <sys/time.h>
# define TIME_VAL(t) (reinterpret_cast<timeval*>((t)->m_data))
# define CONST_TIME_VAL(t) (reinterpret_cast<const timeval*>((t)->m_data))
#endif

void perf_relative_time::appendTo(perf_string &str) const
  {
  char data[32];
  snprintf(data, sizeof(data)/sizeof(char), "%llu", m_data);
  str += data;
  }

perf_absolute_time::perf_absolute_time()
  {
#if defined(__APPLE__)
  static_assert(sizeof(timeval) <= sizeof(m_data), "timeval is too big!");

  gettimeofday(TIME_VAL(this), nullptr);
#endif
  }

perf_relative_time perf_absolute_time::relativeTo(const perf_absolute_time &t) const
  {
  const timeval *ths = CONST_TIME_VAL(this);
  const timeval *relTo = CONST_TIME_VAL(&t);

  perf_relative_time rel;

  rel.m_data = (ths->tv_sec - relTo->tv_sec) * 1000000;
  rel.m_data += (ths->tv_usec - relTo->tv_usec);

  return rel;
  }

void perf_absolute_time::appendTo(perf_string &str) const
  {
  char high[32];
  snprintf(high, sizeof(high)/sizeof(char), "%llu", m_data[0]);
  char low[32];
  snprintf(low, sizeof(low)/sizeof(char), "%llu", m_data[0]);

  str += "[ ";
  str += high;
  str += ", ";
  str += low;
  str += " ]";
  }

