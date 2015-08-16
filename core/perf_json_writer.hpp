#pragma once
#include "perf_context.hpp"

namespace perf
{

/// \brief Writer for producing json data from a perf types
/// \ingroup CPP_API
class PERF_EXPORT json_writer
{
public:
  /// Dump [e] to json in [out]
  void dump(const context::event &e, const context &ctx, string &out, const char *tab);
  /// Dump [ctx] to json and return
  string dump(const context &ctx);

  /// Write the given context to json file, [filename]
  void write(const context &ctx, const char *filename);
};

}
