# zanePerfor一款完整、高性能、高可用的前端性能监控和统计平台
[![Node](https://img.shields.io/badge/node-8.9.0~10.15.1-green.svg?style=plastic)](https://nodejs.org/en/)
[![Vue](https://img.shields.io/badge/vue-2.0+-blue.svg?style=plastic)](https://cn.vuejs.org/)
[![Egg](https://img.shields.io/badge/egg-2.0-green.svg?style=plastic)](https://eggjs.org/)
[![Mogodb](https://img.shields.io/badge/mogodb-4.0+-brightgreen.svg?style=plastic)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/redis-5.0+-green.svg?style=plastic)](https://redis.io/)

## 开发功能进度说明
>  * 集成框架选型及其相关配置（已完成）
>  * 主重数据库相关配置开发（已完成）
>  * web网页sdk开发（已完成）
>  * web端数据库数据后端存储逻辑开发 （已完成）
>  * web端网站性能数据，错误信息，资源加载信息后台逻辑开发（定时任务：已完成）
>  * web端网站PV,UV,IP统计开发（定时任务：已完成）
>  * ip地址库存储逻辑(多种缓存策略：本地文件缓存，redis缓存，mongodb缓存)（已完成）
>  * web端上报脚本开发（已完成）
>  * 分城市统计性能逻辑开发（已完成）
>  * 浏览器端后台cms界面开发（已完成）
>  * 微信小程序sdk开发 （已完成）
>  * 微信小程序相关后端逻辑开发 （已完成）
>  * 微信小程序后台cms界面开发（已完成）
>  * 微信分城市统计性能逻辑开发（已完成）
>  * 用户行为漏斗分析 即用户行为分析（已完成）
>  * TOP性能统计（已完成）
>  * 省市流量统计热力图分析（已完成）
>  * 上报方式新增redis 消息队列（已完成）
>  * 索引优化（已完成）
>  * Mongodb副本集读写分离开发（已完成）
>  * 数据库分表（即分集合）针对于apges,ajaxs,errors,resource,enviroment大数据量表分表，不同应用存储到不同的表中（已完成）
>  * Mongodb集群配置 （已完成）
>  * github第三方登录 （已完成）
>  * 新浪微博第三方登录 （已完成）
>  * 微信授权第三方登录 （已完成）
>  * Mongodb集群分片开发（优化中）
>  * 项目性能优化（已完成）
>  * 邮件触发服务开发（已完成)
>  * 每日日报邮件发送（已完成）
>  * 页面后续操作过程中出现的Error错误、Ajax性能、资源加载的上报（已完成）
>  * 所有预警相关业务开发（开发中）
>  * Kafka消息队列的引入和使用 （已完成）
>  * 应用突破历史流量峰值时触发邮件通知、开发流量预警功能（已完成）
>  * 用户访问实时消费流量统计功能(ajax，页面，资源)（已完成)

## 项目开发文档
* [zanePerfor是什么?](https://blog.seosiwei.com/performance/index.html)
* [zanePerfor在高流量高并发项目下的架构配置建议实践说明](https://blog.seosiwei.com/detail/53)
* [系统高可用之Mongodb集群分片架构](https://blog.seosiwei.com/performance/colony.html)
* [系统高可用之Mongodb副本集读写分离架构](https://blog.seosiwei.com/performance/replica_set.html)
* [Servers集群模式下避免定时任务的多次执行](https://blog.seosiwei.com/performance/repeart_task.html)
* [IP解析城市地理位置逻辑说明](https://blog.seosiwei.com/performance/iptask.html)
* [项目定时任务功能说明](https://blog.seosiwei.com/performance/tasks.html)
* [github 登录授权说明](https://blog.seosiwei.com/performance/github.html)
* [简单通用的Node前后端Token登录机制和github授权登录方式](https://blog.seosiwei.com/detail/49)
* [zanePerfor中集成kafka的开发实践和限流优雅降级](https://blog.seosiwei.com/detail/51)

## 项目说明
* 项目已部署到正式环境，并已稳定运行一段时间，请放心使用。
* 前期推荐使用单机数据库或者Mongodb副本集架构，后期根据自身需求考虑是否使用集群分片
* 目前4核8G单机服务器大概能支撑每日50-100W的pv,8核16G单机服务器可支撑100W-500W的PV流量
* 如果项目日PV超千万，需要Redis集群,Mongodb集群分片的部署方式
* 项目后台查询性能增加合适的索引之后，千万以上的数据量可在100ms-2s之内查询出来，平均100-300ms(单机/副本集)

## 浏览器端使用说明
### 使用SDK方式上报数据
* 使用web SDK进行数据上报，使用方式请参考 web-report-sdk SDK详情

### npm引入使用方式
```js
// install
npm install web-report --save

// 通用版本引入
import { Performance } form 'web-report'
// 使用
Performance({
    domain:'http://report.com/api/v1/report/web',
    add:{
        appId:'D3D9B9AA45B56F6E424F57EFB36B0XXX',
    }
})

import {
    Performance,
    axiosReport,
    defaultReport,
    fetchReport,
    jqueryReport,
    noneReport
} from 'web-report'
// 使用
defaultReport({
    domain:'http://report.com/api/v1/report/web',
    add:{
        appId:'D3D9B9AA45B56F6E424F57EFB36B0XXX',
    }
})
```

### 浏览器端上报SDK详细说明文档请参考：web-report-sdk：
https://github.com/wangweianger/web-report-sdk

## 微信小程序端使用说明
* 直接下载sdk，引入到小程序的app.js最顶部
```js
微信小程序 app.js头部引入sdk

const wxRepotSdk = require('./utils/wx-report-sdk.min');

new wxRepotSdk({
    domain:'http://test.com',
    add:{
        appId:'56F6E424F57EFB36B0XXX'
    }
})

```
### 小程序端上报SDK详细说明文档请参考：wx-report-sdk：
https://github.com/wangweianger/wx-report-sdk

## docker 安装配置环境(非必须)
1. 安装并保证有 docker-compose 的环境
2. 修改 start-docker-compose.sh 里的 hostIP 为外网 IP
⚠️ 不能是 `127.0.0.1` 或 `localhost`

3. docker-compose 启动方式
> 方式一：
```sh
# 项目所在目录
./start-docker-compose.sh
```

> 方式二
```sh
export hostIP='自己的外网IP' && docker-compose up -d --build
```

4. 启动 web 开发环境
```sh
npm run dev
```

5. 启动 web start 环境
⚠️ 修改 config/config.prod.js 里的 redis 配置
```sh
npm start 
```

### 交流和建议群
* 自发布以来有感兴趣的童鞋遇到了各种问题，大部分情况下是通过邮件进行沟通，为了方便解决大家部署中遇到的各种问题，下面贴出一个QQ交流群，有问题或者建议可提出。
![](https://github.com/wangweianger/zanePerfor/blob/master/demo/ewm.jpg "")






