# zanePerfor一款完整、高性能、高可用的前端性能监控和统计平台
## 开发功能进度说明
>  * 集成框架选型及其相关配置（已完成）
>  * 主重数据库相关配置开发（已完成）
>  * web网页sdk开发 （已完成）
>  * web端数据库数据后端存储逻辑开发 （已完成）
>  * web端网站性能数据，错误信息，资源加载信息后台逻辑开发（定时任务：已完成）
>  * web端网站PV,UV,IP统计开发（定时任务：已完成）
>  * ip地址库存储逻辑（已完成）
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
>  * 数据库分表（即分集合）针对于apges,ajaxs,errors,resource,enviroment大数据量表分表，不同应用存储到单独的表中（已完成）
>  * 集群配置 （已完成）
>  * add github login （已完成）
>  * 新浪微博第三方登录 （已完成）
>  * 微信授权第三方登录 （已完成）
>  * Mongodb集群分片开发（优化中）
>  * 项目性能优化（优化中）
>  * 邮件触发服务开发（已完成)
>  * 每日日报邮件发送（已完成）
>  * 所有预警相关业务开发（开发中）
>  * Kafka消息队列的引入和使用 （已完成）

## 技术选型说明
* egg.js,ejs,mongoose,redis,vue.js

## 项目开发文档
* [系统高可用之Mongodb集群分片架构](https://blog.seosiwei.com/performance/colony.html)
* [系统高可用之Mongodb副本集读写分离架构](https://blog.seosiwei.com/performance/replica_set.html)
* [Servers集群模式下避免定时任务的多次执行](https://blog.seosiwei.com/performance/repeart_task.html)
* [IP解析城市地理位置逻辑说明](https://blog.seosiwei.com/performance/iptask.html)
* [项目定时任务功能说明](https://blog.seosiwei.com/performance/tasks.html)
* [github 登录授权](https://blog.seosiwei.com/performance/github.html)
* [简单通用的Node前后端Token登录机制和github授权登录方式](https://blog.seosiwei.com/detail/49)
* [zanePerfor中集成kafka的开发实践和限流优雅降级](https://blog.seosiwei.com/detail/51)

## 项目说明
* 项目已部署到正式环境，并已稳定运行一段时间，请放心使用。
* 前期推荐使用单机数据库或者Mongodb副本集架构，后期根据自身需求考虑是否使用集群分片
* 目前4核8G单机服务器大概能支撑每日50-100W的pv,8核16G单机服务器可支撑100W-500W的PV流量
* 如果项目日PV超千万，需要Redis集群,Mongodb集群分片的部署方式
* 项目后台查询性能增加合适的索引之后，千万以上的数据量可在100ms-2s之内查询出来，平均100-300ms(单机/副本集)

## 分支说明
### master分支
* 项目master分支做了分表功能，即每新增一个应用都会把数据存放到自己的表中，这样很好的做到了横向的扩展，支持N个应用的同时查询也会比较快，因为查询的数据表中全是自己应用的数据
* 此模式适合单机和副本集部署方式，因为表（集合）的名称不固定，如果要做集群分片模式会比较麻烦（应用多的情况），如果应用少，可新增一个应用之后针对新增应用的表做分片。
* 此模式可做集群分片，只是分片操作可能会比较频繁，每增加一个应用，需要分片是就需要去设置分片。
### onetable分支
* onetable所有应用的数据存放于相同表中，因此应用多时数据量比较大，查询会相对于耗时一些
* 基于所有应用数据存放在相同表中，此模式适合做集群分片，分片只需要在项目初始化时执行一次

## 浏览器端使用说明
### 使用SDK方式上报数据(推荐)
* 使用web SDK进行数据上报，使用方式请参考 web-report-sdk SDK详情
* 例如

### npm引入使用方式
```js
// 通用版本引入
import Performance form 'web-report'
// 使用
Performance({
    domain:'http://report.com/api/v1/report/web',
    add:{
        appId:'D3D9B9AA45B56F6E424F57EFB36B0XXX',
    }
})

// 按需引入
import {
  axiosReport,
  defaultReport,
  fetchReport,
  jqueryReport,
  noneReport,
} from 'web-report'
// 使用
defaultReport({
    domain:'http://report.com/api/v1/report/web',
    add:{
        appId:'D3D9B9AA45B56F6E424F57EFB36B0XXX',
    }
})
```

### 浏览器端上报SDK web-report-sdk：
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
### 小程序端上报SDK wx-report-sdk：
https://github.com/wangweianger/wx-report-sdk

### github 登录授权
https://blog.seosiwei.com/performance/github.html

## 服务架构探索
* 针对于不同的项目，不同的并发量，后期关于项目服务架构我会写一篇独立的文档（待写...）。

