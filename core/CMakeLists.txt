###############################################################################
# C library
###############################################################################

add_library(perf SHARED
  # Public API's
  perf.h
  perf.hpp

  perf_allocator.hpp
  perf_benchmark.hpp
  perf_config.hpp
  perf_context.hpp
  perf_event.hpp
  perf_global.hpp
  perf_identity.hpp
  perf_json_writer.hpp
  perf_meta_event.hpp
  perf_single_fire_event.hpp
  perf_string.hpp
  perf_time.hpp
  perf_util.hpp

  src/perf.cpp
  src/perf_config.cpp
  src/perf_context.cpp
  src/perf_identity.cpp
  src/perf_json_writer.cpp
  src/perf_meta_event.cpp
  src/perf_single_fire_event.cpp
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
    PERF_X64 # todo: this isnt always the case...
)

# Enable all warnings
if(WIN32)
  # Force to always compile with W4
  if(CMAKE_CXX_FLAGS MATCHES "/W[0-4]")
    string(REGEX REPLACE "/W[0-4]" "/W4" CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS}")
  else()
    set(CPP_FLAGS "${CMAKE_CXX_FLAGS} /W4")
  endif()

  target_link_libraries(perf
    PRIVATE
	 PowrProf.lib
  )
  
elseif(CMAKE_COMPILER_IS_GNUCC OR CMAKE_COMPILER_IS_GNUCXX)
  set(CPP_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wno-long-long -pedantic")
endif()

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${CPP_FLAGS}")