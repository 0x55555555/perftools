#include "perf_io.hpp"
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
  
void json_writer::dump(const context::event &e, string &out, const char *tab)
  {
  out += "    {\n"
  "      \"name\":\"";
  out += e.name.data();
  
  out += "\",\n"
  "      \"time\":";
  r.m_time.append_to(out);
  out += "\n";
  
  out += "    }";
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
    
    dump(e, results, "    ");
    }

  results += "\n";

  results += "  ]\n";

  results += "}\n";
  return results;
  }

}
