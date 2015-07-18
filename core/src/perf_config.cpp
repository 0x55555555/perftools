#include "perf.hpp"
#include "perf_global.hpp"

namespace perf
{

config::config(const char *binding, const allocator_base &alloc)
  : m_identity(identity::this_machine(binding))
  , m_allocator(alloc)
  {
  }
  
void config::register_context(context &c)
  {
  check(c.config() == this);
  ++m_context_count;
  }

void config::unregister_context(context &c)
  {
  check(c.config() == nullptr);
  --m_context_count;
  }

}
