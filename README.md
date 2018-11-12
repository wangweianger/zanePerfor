## 前端性能监控系统

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
>  * 项目性能优化（进行中）
>  * 索引优化（已完成）
>  * 大数据量下的（千万，亿级别）数据查询优化切换方案（千万级别以下实时查询，千万以上缓存读取） （开发中）
>  * Kafka消息队列的引入和使用 （排期中）
>  * 生产环境架构（构建中）
>  * 所有预警相关业务开发（排期中）
>  * 集群配置 （排期中）
>  * 性能测试（排期中）

## 服务架构说明
### 一：技术选型说明
* egg.js,ejs,mongoose,redis,vue.js

## 项目详细文档
https://blog.seosiwei.com/performance/index.html
* 服务架构探索
* 如何保证高并发秒杀场景的服务正常运行
* 如何保证项目的高可用，高性能
* 还有很多需要慢慢的去完善...

## 浏览器端使用说明
### 使用SDK方式上报数据(推荐)
* 使用web SDK进行数据上报，使用方式请参考 web-report-sdk SDK详情
* 例如
```
Performance({
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
```
微信小程序 app.js头部引入sdk

const wxRepotSdk = require('./utils/wx-report-sdk.min');

new wxRepotSdk({
    domain:'http://test.com',
    add:{
        appId:'123456789'
    }
})

```
### 小程序端上报SDK wx-report-sdk：
https://github.com/wangweianger/wx-report-sdk

## 服务架构探索
* 针对于不同的项目，不同的并发量，后期关于项目服务架构我会写一篇独立的文档（待写...）。

## mongodb可视化工具推荐 Robomongo
链接地址：https://robomongo.org/download

## DEMO图片
![](https://github.com/wangweianger/egg-mongoose-performance-system/blob/master/demo/01.png "")
![](https://github.com/wangweianger/egg-mongoose-performance-system/blob/master/demo/02.png "")
![](https://github.com/wangweianger/egg-mongoose-performance-system/blob/master/demo/03.png "")
![](https://github.com/wangweianger/egg-mongoose-performance-system/blob/master/demo/04.png "")
![](https://github.com/wangweianger/egg-mongoose-performance-system/blob/master/demo/05.png "")
![](https://github.com/wangweianger/egg-mongoose-performance-system/blob/master/demo/06.png "")
![](https://github.com/wangweianger/egg-mongoose-performance-system/blob/master/demo/07.png "")
![](https://github.com/wangweianger/egg-mongoose-performance-system/blob/master/demo/08.png "")
![](https://github.com/wangweianger/egg-mongoose-performance-system/blob/master/demo/09.png "")
![](https://github.com/wangweianger/egg-mongoose-performance-system/blob/master/demo/10.png "")
![](https://github.com/wangweianger/egg-mongoose-performance-system/blob/master/demo/11.png "")
![](https://github.com/wangweianger/egg-mongoose-performance-system/blob/master/demo/12.png "")