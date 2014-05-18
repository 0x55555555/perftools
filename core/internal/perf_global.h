#pragma once

#include <string>
#define PERF_API_CHECK_PTR(ptr, err) if (ptr == nullptr) { err; }

