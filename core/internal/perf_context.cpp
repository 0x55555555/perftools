#include "perf_context.h"
#include <cstdio>

perf_context *perf_context::init(perf_config *c, const char *name)
  {
  PERF_API_CHECK_PTR(c, return nullptr);
  PERF_API_CHECK_PTR(name, return nullptr);

  auto a = c->create<perf_context>();

  a->m_records.~Records();
  new(&a->m_records) Records(c);
  c->addContext(a);

  a->m_results.~perf_string();
  new(&a->m_results) perf_string(c);

  a->m_name.~perf_string();
  new(&a->m_name) perf_string(name, c);

  return a;
  }

bool perf_context::check(const perf_context *c)
  {
  return c != 0;
  }

void perf_context::term(perf_context *c)
  {
  c->m_config->destroy(c);
  }

void perf_context::add(perf_context *c, const char *n)
  {
  if (!check(c))
    {
    return;
    }

  c->record(n);
  }

void perf_context::write(perf_context *c, const char *n)
  {
  if (!check(c))
    {
    return;
    }

  c->cacheResults();

  auto file = fopen(n, "w");
  if (!file)
    {
    c->m_error = perf_failed_to_write_file;
    return;
    }

  if (fwrite(c->m_results.data(), sizeof(char), c->m_results.size(), file) != c->m_results.size())
    {
    c->m_error = perf_failed_to_write_file;
    return;
    }

  fclose(file);
  }

const char *perf_context::dump(perf_context *c)
  {
  if (!check(c))
    {
    return nullptr;
    }

  c->cacheResults();
  return c->m_results.data();
  }

perf_context::perf_context()
    : m_config(nullptr),
      m_error(perf_no_error)
  {
  }

perf_context::Record::Record(const char *c, perf_context *ctx, const perf_relative_time &t)
    : m_name(c, ctx->config()),
      m_time(t)
  {
  }

void perf_context::record(const char *id)
  {
  if (m_results.size())
    {
    m_error = perf_recording_after_output;
    return;
    }

  perf_relative_time rel = perf_absolute_time().relativeTo(m_start);

  m_records.emplace_back(id, this, rel);
  }

void perf_context::cacheResults()
  {
  m_results =
  "{\n"
  "  \"name\": \"";
  m_results += m_name;

  m_results += "\",\n"
  "  \"machineIdentity\": ";

  m_config->m_identity.appendIdentity(m_results, "  ");

  m_results += ",\n"
  "  \"start\": ";
  m_start.appendTo(m_results);

  m_results += ",\n"
  "  \"results\": [\n";

  bool started = false;
  for(const Record &r : m_records)
    {
    if (started)
      {
      m_results += ",\n";
      }
    started = true;
    m_results += "    {\n"
    "      \"name\":\"";
    m_results += r.m_name;

    m_results += "\",\n"
    "      \"time\":";
    r.m_time.appendTo(m_results);
    m_results += "\n";

    m_results += "    }";
    }

  m_results += "\n";

  m_results += "  ]\n";

  m_results += "}\n";
  }
