#include "perf_context.hpp"
#include <cmath>

namespace perf
{

namespace
{
const allocator_base &check_allocator(perf::config *c)
  {
  check(c);
  return c->allocator();
  }
}

context::context(perf::config *c, const char *name)
  : m_config(c)
  , m_events(check_allocator(m_config))
  , m_start(std::chrono::system_clock::now())
  , m_root(this, "root")
  {
  check(name);

  m_name += name;
  m_config->register_context(*this, detail::private_dummy());
  }

context::~context()
  {
  m_config->unregister_context(*this, detail::private_dummy());
  m_config = nullptr;
  }
  
std::uint64_t context::start_time() const
  {
  std::time_t time = std::chrono::system_clock::to_time_t(m_start);
  return time;
  }
  
detail::event_reference context::add_event(const char *name, detail::event_reference *parent)
  {
  std::lock_guard<std::mutex> l(m_events_mutex);

  detail::event_reference ref(m_events.size());
  m_events.emplace_back(name, parent ? *parent : m_root.get_event_reference());

  return ref;
  }

void context::fire_event(
  detail::event_reference &event,
  const time &parent_start,
  const time &begin,
  const time &end)
  {
  auto &ev = m_events[event.index];
  ++ev.fire_count;

  const std::uint64_t offset = (begin - parent_start).count();
  const std::uint64_t new_time = (end - begin).count();

  ev.offset.append(offset);
  ev.duration.append(new_time);
  }

void context::fire_event(
  detail::event_reference &event,
  const time &parent_start,
  const time &point)
  {
  fire_event(event, parent_start, point, point);
  }

void context::finish_event(detail::event_reference &event)
  {
  }

context::time_group::time_group()
  : min_time(std::numeric_limits<decltype(max_time.load())>::max())
  , max_time(0)
  , total_time(0)
  , total_time_sq(0)
  {
  }

context::time_group::time_group(time_group &&grp)
  : min_time(grp.min_time.load())
  , max_time(grp.max_time.load())
  , total_time(grp.total_time.load())
  , total_time_sq(grp.total_time_sq.load())
  {
  }

context::time_group &context::time_group::operator=(time_group &&grp)
  {
  min_time.store(grp.min_time.load());
  max_time.store(grp.max_time.load());
  total_time.store(grp.total_time.load());
  total_time_sq.store(grp.total_time_sq.load());

  return *this;
  }

void context::time_group::append(std::uint64_t duration)
  {
  total_time += duration;
  total_time_sq += duration * duration;

  // Update max time
    {
    std::uint64_t prev_value = max_time;
    while(prev_value < duration && !max_time.compare_exchange_weak(prev_value, duration)) ;
    }

  // Update min time
    {
    std::uint64_t prev_value = min_time;
    while(prev_value > duration && !min_time.compare_exchange_weak(prev_value, duration)) ;
    }
  }

context::event::event(const char *name, const detail::event_reference &parent)
  : parent(parent)
  , name(name)
  , fire_count(0)
  {
  }

context::event::event(event &&ev)
  : parent(ev.parent)
  , name(ev.name)
  , fire_count(ev.fire_count.load())
  , offset(std::move(ev.offset))
  , duration(std::move(ev.duration))
  {
  }

context::event &context::event::operator=(event &&ev)
  {
  parent = ev.parent;
  name = ev.name;
  fire_count.store(ev.fire_count.load());
  duration = std::move(ev.duration);
  offset = std::move(ev.offset);
  return *this;
  }
  
double context::event::average() const
  {
  return double(duration.total_time) / fire_count;
  }
  
double context::event::sd() const
  {
  auto mean_sq = double(duration.total_time_sq) / fire_count;
  auto mean = average();
  
  return std::sqrt(mean_sq - (mean * mean));
  }
}
