###############################################################################
# C library
###############################################################################

add_library(perf SHARED

  # Public API's
  perf.h
  cpp/perf.hpp

  # Implementation
  internal/perf.cpp
  internal/perf_global.hpp
  internal/perf_allocator.hpp
  internal/perf_config.hpp
  internal/perf_config.cpp
  internal/perf_context.hpp
  internal/perf_context.cpp
  internal/perf_identity.hpp
  internal/perf_identity.cpp
  internal/perf_time.hpp
  internal/perf_time.cpp
)

target_include_directories(perf
  PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
  PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/internal
)

target_compile_definitions(perf
  PRIVATE
    PERF_BUILD
)

###############################################################################
# Cpp library
###############################################################################

add_library(perf_cpp INTERFACE
)

target_sources(perf_cpp 
  INTERFACE
    ${CMAKE_CURRENT_SOURCE_DIR}/cpp/perf.hpp
)


target_include_directories(perf_cpp
  INTERFACE
    ${CMAKE_CURRENT_SOURCE_DIR}/cpp
)