#pragma once

namespace perf
{

class context;

namespace detail
{

class private_dummy
  {
private:
  private_dummy() { }
  private_dummy(const private_dummy &) = delete;
  private_dummy &operator=(const private_dummy &) = delete;
  friend class perf::context;
  };

class event_reference
  {
public:
  bool operator!=(const event_reference &ev) const
    {
    return index != ev.index;
    }

private:
  std::size_t index = std::numeric_limits<std::size_t>::max();
  friend class perf::context;
  };
}
}
