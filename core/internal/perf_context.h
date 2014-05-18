#pragma once
#include "perf_global.h"
#include "perf_config.h"
#include "perf_time.h"
#include <vector>

struct perf_context
  {
  static perf_context *init(perf_config *c, const char *name);
  static bool check(const perf_context *c);
  static void term(perf_context *c);

  static void add(perf_context *c, const char *n);

  static void write(perf_context *c, const char *n);
  static const char *dump(perf_context *c);

  perf_context();

  void record(const char *id);

  perf_error error() const { return m_error; }
  perf_config *config() const { return m_config; }

private:
  void cacheResults();

  perf_string m_results;

  perf_config *m_config;
  perf_error m_error;
  perf_absolute_time m_start;
  perf_string m_name;

  friend struct perf_config;

  struct Record
    {
    Record(const char *id, perf_context *ctx, const perf_relative_time &t);

    perf_string m_name;
    perf_relative_time m_time;
    };

  typedef std::vector<Record, perf_allocator<Record>> Records;
  std::vector<Record, perf_allocator<Record>> m_records;
  };
