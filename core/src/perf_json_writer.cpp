#include "perf_json_writer.hpp"
#include <cstdio>
#include <stdexcept>

namespace perf
{

void json_writer::write(const context &c, const char *filename)
  {
  string output = dump(c);

  auto file = fopen(filename, "w");
  if (!file)
    {
    throw std::invalid_argument("filename");
    }

  if (fwrite(output.data(), sizeof(char), output.size(), file) != output.size())
    {
    throw std::runtime_error("writing data");
    }

  fclose(file);
  }

void json_writer::dump(const context::event &e, const context &ctx, string &out, const char *tab)
  {
  append(out, tab, "{\n");
  append(out, tab, "  \"name\": \"", e.name, "\",\n");
  if (e.parent != detail::event_reference())
    {
    append(out, tab, "  \"parent\": \"", ctx.event_for(e.parent).name, "\",\n");
    }

  append(out, tab, "  \"fire_count\": ", e.fire_count, ",\n");
  append(out, tab, "  \"min_time\": ", e.min_time, ",\n");
  append(out, tab, "  \"max_time\": ", e.max_time, ",\n");
  append(out, tab, "  \"total_time\": ", e.total_time, ",\n");
  append(out, tab, "  \"total_time_sq\": ", e.total_time_sq, "\n");
  append(out, tab, "}");
  }

string json_writer::dump(const context &c)
  {
  auto conf = c.get_config();
  string results(conf->allocator());

  results =
  "{\n"
  "  \"name\": \"";
  results += c.name().data();

  results += "\",\n"
  "  \"machine_identity\": ";

  conf->get_identity().json_description(results, "  ");

  results += ",\n"
  "  \"results\": [\n";


  bool started = false;
  for(const auto &e : c.events())
    {
    if (started)
      {
      results += ",\n";
      }
    started = true;

    dump(e, c, results, "    ");
    }

  results += "\n";

  results += "  ]\n";

  results += "}\n";
  return results;
  }

}
