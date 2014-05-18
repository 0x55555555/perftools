#-------------------------------------------------
#
# Project created by QtCreator 2014-05-18T13:09:40
#
#-------------------------------------------------

QT       += testlib

QT       -= gui

TARGET = tst_cpptesttest
CONFIG   += console testcase
CONFIG   -= app_bundle

TEMPLATE = app

INCLUDEPATH += ../../core

LIBS += -L../../core/build/bin -lperf

SOURCES += tst_cpptesttest.cpp
DEFINES += SRCDIR=\\\"$$PWD/\\\"
