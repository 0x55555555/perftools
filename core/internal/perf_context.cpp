#include "perf_context.hpp"
#include <cstdio>

perf_context *perf_context::init(perf_config *c, const char *name)
  {
  PERF_API_CHECK_PTR(c, return nullptr);
  PERF_API_CHECK_PTR(name, return nullptr);

  auto a = c->create<perf_context>(name, c);

  c->add_context(a);

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

  c->create_record(n);
  }

void perf_context::write(perf_context *c, const char *n)
  {
  if (!check(c))
    {
    return;
    }

  c->cache_results();

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

  c->cache_results();
  return c->m_results.data();
  }

perf_context::perf_context(const char *name, perf_config *config)
    : m_results(config),
      m_config(config),
      m_error(perf_no_error),
      m_name(name, config),
      m_records(config)
  {
  }

perf_context::record::record(const char *c, perf_context *ctx, const perf_relative_time &t)
    : m_name(c, ctx->config()),
      m_time(t)
  {
  }

void perf_context::create_record(const char *id)
  {
  if (m_results.size())
    {
    m_error = perf_recording_after_output;
    return;
    }

  perf_relative_time rel = perf_absolute_time().relative_to(m_start);

  m_records.emplace_back(id, this, rel);
  }

void perf_context::cache_results()
  {
  m_results =
  "{\n"
  "  \"name\": \"";
  m_results += m_name;

  m_results += "\",\n"
  "  \"machineIdentity\": ";

  m_config->m_identity.append_identity(m_results, "  ");

  m_results += ",\n"
  "  \"start\": ";
  m_start.append_to(m_results);

  m_results += ",\n"
  "  \"results\": [\n";

  bool started = false;
  for(const auto &r : m_records)
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
    r.m_time.append_to(m_results);
    m_results += "\n";

    m_results += "    }";
    }

  m_results += "\n";

  m_results += "  ]\n";

  m_results += "}\n";
  }
