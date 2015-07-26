#include "perf_config.hpp"
#include "perf_context.hpp"
#include "perf_global.hpp"

namespace perf
{

config::config(const char *binding, const allocator_base &alloc)
  : m_identity(identity::this_machine(binding))
  , m_allocator(alloc)
  {
  }

void config::register_context(context &c, const detail::private_dummy &)
  {
  check(c.get_config() == this);
  ++m_context_count;
  }

void config::unregister_context(context &c, const detail::private_dummy &)
  {
  check(c.get_config() == this);
  --m_context_count;
  }

}
