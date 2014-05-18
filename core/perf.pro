QT       -= core gui

CONFIG += debug

DESTDIR = build/bin
OBJECTS_DIR = build/obj

TARGET = perf
TEMPLATE = lib

DEFINES += PERF_BUILD

SOURCES += perf.cpp \
    internal/perf_context.cpp \
    internal/perf_config.cpp \
    internal/perf_identity.cpp \
    internal/perf_time.cpp

HEADERS += perf.h \
    internal/perf_context.h \
    internal/perf_config.h \
    internal/perf_global.h \
    internal/perf_identity.h \
    internal/perf_time.h \
    internal/perf_allocator.h \
    perf.hpp

QMAKE_CXXFLAGS += -Wall

INCLUDEPATH += "internal"

macx-clang {
  QMAKE_MACOSX_DEPLOYMENT_TARGET = 10.7
  QMAKE_CXXFLAGS += -std=c++11 -stdlib=libc++

  LIBS += -mmacosx-version-min=10.7 -stdlib=libc++
}
