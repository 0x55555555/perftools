#pragma once

template <typename T> void perf_ptr_check(T *t)
  {
  if (!t)
    {
    throw;
    }
  }

template <typename T> void perf_check(T *t)
  {
  if (!T::check(t))
    {
    throw;
    }
  }