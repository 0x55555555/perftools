#pragma once
#include "perf_global.h"
#include "perf_config.h"
#include "perf_time.h"
#include <vector>

struct perf_context
  {
  static perf_context *init(perf_config *c);
  static bool check(const perf_context *c);
  static void term(perf_context *c);

  perf_context();

  void record(const char *id);

  perf_error error() const { return m_error; }
  perf_config *config() const { return m_config; }

private:
  perf_config *m_config;
  perf_error m_error;
  perf_absolute_time m_start;

  friend struct perf_config;

  struct Record
    {
    Record(const char *id, perf_context *ctx, const perf_relative_time &t);

    std::basic_string<char, std::char_traits<char>, perf_allocator<char> > m_name;
    perf_relative_time m_time;
    };

  std::vector<Record, perf_allocator<Record>> m_records;
  };
