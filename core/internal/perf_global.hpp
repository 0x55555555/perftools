#pragma once

#define PERF_API_CHECK_PTR(ptr, err) if (ptr == nullptr) { err; }

