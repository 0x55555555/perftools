#include "perf.hpp"

namespace perf
{
  
namespace
{
const allocator_base &check_allocator(perf::config *c)
  {
  ptr_check(c);
  return c->allocator();
  }
}

context::context(perf::config *c, const char *name)
  : m_config(c)
  , m_events(check_allocator(m_config))
  , m_root(this, "root")
  {
  ptr_check(name);

  m_name += name;
  m_config->register_context(*this);
  }

context::~context()
  {
  m_config->unregister_context(*this);
  m_config = nullptr;
  }

detail::event_reference context::add_event(const char *name, detail::event_reference *parent)
  {
  std::lock_guard<std::mutex> l(m_events_mutex);

  detail::event_reference ref;
  ref.index = m_events.size();
  m_events.emplace_back(name, parent ? parent : &m_root.get_event_reference());

  return ref;
  }

void context::fire_event(
  detail::event_reference &event,
  const time &begin,
  const time &end)
  {
  auto &ev = m_events[event.index];
  ++ev.fire_count;

  const std::uint64_t new_time = (begin - end).count();
  
  ev.total_time += new_time;
  ev.total_time_sq += new_time * new_time;
  
  // Update max time
    {
    std::uint64_t prev_value = ev.max_time;
    while(prev_value < new_time && !ev.max_time.compare_exchange_weak(prev_value, new_time)) ;
    }
  
  // Update min time
    {
    std::uint64_t prev_value = ev.min_time;
    while(prev_value > new_time && !ev.min_time.compare_exchange_weak(prev_value, new_time)) ;
    }
  }

void context::fire_event(
  detail::event_reference &event,
  const time &point)
  {
  fire_event(event, point, point);
  }

void context::finish_event(detail::event_reference &parent)
  {
  }

context::event::event(const char *name, detail::event_reference *parent)
  : parent(parent->index)
  , name(name)
  , fire_count(0)
  , min_time(std::numeric_limits<decltype(max_time.load())>::max())
  , max_time(0)
  , total_time(0)
  , total_time_sq(0)
  {
  }

context::event::event(event &&ev)
  : parent(ev.parent)
  , name(ev.name)
  , fire_count(ev.fire_count.load())
  , min_time(ev.min_time.load())
  , max_time(ev.max_time.load())
  , total_time(ev.total_time.load())
  , total_time_sq(ev.total_time_sq.load())
  {
  }

context::event &context::event::operator=(event &&ev)
  {
  parent = ev.parent;
  name = ev.name;
  fire_count.store(ev.fire_count.load());
  min_time.store(ev.min_time.load());
  max_time.store(ev.max_time.load());
  total_time.store(ev.total_time.load());
  total_time_sq.store(ev.total_time_sq.load());
  return *this;
  }
}
