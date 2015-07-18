#pragma once
#include "perf.hpp"

namespace perf
{

class json_writer
{
public:
  string dump(const context &);

  void write(const context &ctx, const char *filename);
};

}
