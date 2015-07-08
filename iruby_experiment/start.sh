#!/bin/bash

export PATH=~/miniconda3/bin/:$PATH
mongod --dbpath ./data &

rvm use 2.2.0
iruby notebook