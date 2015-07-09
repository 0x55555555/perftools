#pragma once
#include "perf_allocator.hpp"

using perf_string = std::basic_string<char, std::char_traits<char>, perf_allocator<char>>;

template <typename T> void appendf(perf_string &str, const T &t, const char *format)
  {
  auto old_size = str.size();
  std::size_t reserved = 128;
  str.resize(str.size() + reserved);
  auto used = snprintf(&str[0] + old_size, reserved, format, t);
  
  str.resize(old_size + used);
  }

// If this complains - you may be trying to print things that are not defined.
template <typename T> inline void append(perf_string &str, const T &t);

inline void append(perf_string &str, const char *t)
  {
  str += t;
  }

inline void append(perf_string &str, const perf_string &t)
  {
  str += t;
  }

inline void append(perf_string &str, unsigned long long t)
  {
  appendf(str, t, "%ull");
  }

inline void append(perf_string &str, unsigned long t)
  {
  appendf(str, t, "%ul");
  }

template <typename... Args, typename T> void append(perf_string &str, const T &t, Args &&...args)
  {
  append(str, t);
  append(str, std::forward<Args>(args)...);
  }
  