#include "perf_json_writer.hpp"
#include <cstdio>
#include <stdexcept>

namespace perf
{

void json_writer::write(const context &c, const char *filename)
  {
  string output = dump(c);

  FILE *file = nullptr;
#if _WIN32
  if (!fopen_s(&file, filename, "w"))
    {
    file = nullptr;
    }
#else
  file = fopen(filename, "w");
#endif

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
  append(out, tab, "  \"name\": \"", e.name, "\"");

  if (e.parent != detail::event_reference::invalid_reference())
    {
    append(out, ",\n");
    append(out, tab, "  \"parent\": \"", ctx.event_for(e.parent).name, "\"");
    }

  if (e.fire_count)
    {
    append(out, ",\n");
    append(out, tab, "  \"fire_count\": ", e.fire_count);
    
    if (e.duration.total_time > 0)
      {
      append(out, ",\n");
      append(out, tab, "  \"min_time\": ", e.duration.min_time, ",\n");
      append(out, tab, "  \"max_time\": ", e.duration.max_time, ",\n");
      append(out, tab, "  \"total_time\": ", e.duration.total_time, ",\n");
      append(out, tab, "  \"total_time_sq\": ", e.duration.total_time_sq);
      }
    
    if (e.offset.total_time > 0)
      {
      append(out, ",\n");
      append(out, tab, "  \"min_offset_time\": ", e.offset.min_time, ",\n");
      append(out, tab, "  \"max_offset_time\": ", e.offset.max_time, ",\n");
      append(out, tab, "  \"total_offset_time\": ", e.offset.total_time, ",\n");
      append(out, tab, "  \"total_offset_time_sq\": ", e.offset.total_time_sq);
      }
    }
  append(out, "\n", tab, "}");
  }

string json_writer::dump(const context &c)
  {
  auto conf = c.get_config();
  string results(conf->allocator());

  append(results,
    "{\n"
    "  \"name\": \"", c.name(), "\",\n"
    "  \"machine_identity\": ");

  conf->get_identity().json_description(results, "  ");

  append(results, ",\n"
    "  \"start\": ", c.start_time(), ",\n"
    "  \"results\": [\n");


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

  append(results, "\n"
    "  ]\n"
    "}\n");
  return results;
  }

}
