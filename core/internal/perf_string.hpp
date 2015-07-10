#pragma once
#include "perf_allocator.hpp"

using perf_string = std::basic_string<char, std::char_traits<char>, perf_allocator<char>>;
template <std::size_t Size> class basic_perf_short_string;

inline std::size_t max_resize_size(perf_string &)
  {
  return std::numeric_limits<std::size_t>::max();
  }

template <std::size_t Size> std::size_t max_resize_size(basic_perf_short_string<Size> &)
  {
  return Size-1;
  }

/// Append [t] to [str], with the string format [format]
template <typename StringType, typename T> void appendf(StringType &str, const T &t, const char *format)
  {
  auto old_size = str.size();
  std::size_t likely_required_size = 128;
  auto tmp_size = std::min(str.size() + likely_required_size, max_resize_size(str));
  str.resize(tmp_size);
  auto used = snprintf(&str[0] + old_size, tmp_size - old_size, format, t);
  
  str.resize(old_size + used);
  }

template <std::size_t Size> class basic_perf_short_string
  {
public:
  basic_perf_short_string()
    : m_data { '\0' }
    {
    }

  std::size_t capacity() const { return Size; }
  std::size_t size() const { return strlen(m_data); }
  char *data() { return m_data; }
  const char *data() const { return m_data; }

  char &operator[](std::size_t i) { return m_data[i]; }

  void resize(std::size_t new_size)
    {
    assert(new_size < Size);
    m_data[new_size] = '\0';
    }

  basic_perf_short_string &operator+=(const char *t)
    {
    appendf(*this, t, "%s");
    return *this;
    }
  
  basic_perf_short_string &operator+=(const basic_perf_short_string &t)
    {
    appendf(*this, t.data(), "%s");
    return *this;
    }
  
private:
  char m_data[Size];
  };
using perf_short_string = basic_perf_short_string<64>;

template <typename StringType> void append(StringType &str, const char *t)
  {
  str += t;
  }

template <typename StringTypeA, typename StringTypeB> void append(StringTypeA &str, const StringTypeB &t)
  {
  str += t.data();
  }

template <typename StringType> void append(StringType &str, unsigned long long t)
  {
  appendf(str, t, "%llu");
  }

template <typename StringType> void append(StringType &str, unsigned long t)
  {
  appendf(str, t, "%lu");
  }

template <typename StringType, typename... Args, typename T> void append(StringType &str, const T &t, Args &&...args)
  {
  append(str, t);
  append(str, std::forward<Args>(args)...);
  }
  