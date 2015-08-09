add_executable(perf_cpp_test
  cpp_test.cpp
)

target_include_directories(perf_cpp_test
  PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
)

target_include_directories(perf_cpp_test SYSTEM
  PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/../../external/jsoncons/src
    ${CMAKE_CURRENT_SOURCE_DIR}/../../external/Catch/include
)

target_link_libraries(perf_cpp_test
  perf
)

if(MSVC)
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /W3")
endif()

add_test(NAME perf_cpp_test
  COMMAND
    perf_cpp_test
  WORKING_DIRECTORY
    ${CMAKE_CURRENT_SOURCE_DIR}/../
)
