#include "perf_single_fire_event.hpp"
#include "perf_context.hpp"

namespace perf
{
single_fire_event::single_fire_event(context *ctx, const char *name)
  : meta_event(ctx, name), event(&ctx->root_event(), this)
  {
  }

}
