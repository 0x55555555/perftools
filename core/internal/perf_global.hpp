#pragma once
#include <stdexcept>

template <typename T> void perf_ptr_check(T *t)
  {
  if (!t)
    {
    throw std::runtime_error("");
    }
  }

template <typename T> void perf_check(T *t)
  {
  perf_ptr_check(t);
  
  if (!T::check(t))
    {
    throw std::runtime_error("");
    }
  }

inline void perf_check(bool b)
  {
  if (!b)
    {
    throw std::runtime_error("");
    }
  }