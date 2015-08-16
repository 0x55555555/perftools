#pragma once
/// \mainpage PerfTools
/// PerfTools is a set of performance tools to profile applications.
/// The main API is written in C++, but other languages are bound in via C bindings.

/// \defgroup CPP_API
/// Perf core classes are implemented and exposed via C++. This API provides the
/// tighest integration with core performance classes.

#include "perf_identity.hpp"
#include "perf_config.hpp"
#include "perf_time.hpp"
#include "perf_string.hpp"
#include "perf_meta_event.hpp"
#include "perf_event.hpp"
#include "perf_single_fire_event.hpp"
#include "perf_context.hpp"
#include "perf_json_writer.hpp"
#include "perf_benchmark.hpp"
