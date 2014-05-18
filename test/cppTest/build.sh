#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

export DYLD_LIBRARY_PATH=$DIR"/../../core/build/bin"

qmake
make check

