#
# Finds the Perf Tools library and header files.
#

find_path(Perf_INCLUDE_DIR
    NAMES perf.h
)

find_library(Perf_LIBRARY
    NAMES perf
)

set(Perf_LIBRARY
    "${Perf_LIBRARY}"
    CACHE STRING "The Perf Tools library"
)

include(FindPackageHandleStandardArgs)
find_package_handle_standard_args(Perf
    FOUND_VAR
        Perf_FOUND
    REQUIRED_VARS
        Perf_LIBRARY
        Perf_INCLUDE_DIR
)
