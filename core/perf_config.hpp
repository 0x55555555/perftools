#pragma once
#include <atomic>
#include "perf_allocator.hpp"
#include "perf_identity.hpp"
#include "perf_util.hpp"

namespace perf
{

class context;

/// \brief A config holds whole library information for perf to use
/// including allocation strategies, and identity information.
/// \ingroup CPP_API
class PERF_EXPORT config
  {
public:
  config(const char *binding="cpp", const allocator_base &a = allocator_base());
  config(const config &) = delete;
  config &operator=(const config &) = delete;

  ~config()
    {
    }

  /// Get the description for this config.
  const perf::identity &get_identity() const
    {
    return m_identity;
    }

  /// Get the allocator to be used internally in perf.
  const perf::allocator_base &allocator() const
    {
    return m_allocator;
    }

  /// When a context is constructed this is called internally.
  /// \private
  void register_context(context &, const detail::private_dummy &);
  /// When a context is destroyed this is called internally.
  /// \private
  void unregister_context(context &, const detail::private_dummy &);

private:
  allocator_base m_allocator;
  identity m_identity;
  std::atomic<std::size_t> m_context_count;
  };

}
