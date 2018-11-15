#!/bin/bash

cd /data/performance
npm stop
ps -ef | grep performance | grep -v grep | grep -v PPID | awk '{ print $2}' | xargs kill -9
# sleep 10s
npm start
result=$?

while [ $result -ne 0 ]
do
    npm start
    result=$?
    if [ $result -eq 0 ]
    then
        echo "执行成功退出循环"
    else
        echo "执行失败重新执行"
    fi
done
npm start

