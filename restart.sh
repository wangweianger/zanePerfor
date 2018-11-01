#!/bin/bash

cd /data/performance
#npm stop
ps -ef | grep performance | grep -v grep | grep -v PPID | awk '{ print $2}' | xargs kill -9
sleep 20s
npm start


