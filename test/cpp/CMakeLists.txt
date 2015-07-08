add_executable(perf_cpp_test
  cpp_test.cpp
)

target_include_directories(perf_cpp_test
  PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
)

target_include_directories(perf_cpp_test SYSTEM
  PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/../../external/bandit
)

target_link_libraries(perf_cpp_test
  perf
  perf_cpp
)

add_test(NAME perf_cpp_test
  COMMAND
    perf_cpp_test
  WORKING_DIRECTORY
    ${CMAKE_CURRENT_SOURCE_DIR}/../
)