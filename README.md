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
>  * 生产环境架构（构建中）
>  * 所有预警相关业务开发（排期中）
>  * 集群配置 （排期中）
>  * 性能测试（排期中）

## 服务架构说明
### 一：技术选型说明
* egg.js,ejs,mongoose,redis,vue.js

### 项目详细文档
https://blog.seosiwei.com/performance/index.html

## 浏览器端使用说明
### 一：直接使用应用脚本上报数据
* 申请应用之后直接使用应用脚本，放置到自己web应用的头部。
* 例如：<script src="http://report.com/api/v1/report/webscript?appId=D3D9B9AA45B56F6E424F57EFB36B063B&USESDK=FALSE"></script>

### 二：使用SDK方式上报数据(推荐)
* 使用web SDK进行数据上报，使用方式请参考 performance-report SDK详情
* 例如
```
Performance({
    domain:'http://report.com/api/v1/report/web',
    add:{
        appId:'D3D9B9AA45B56F6E424F57EFB36B063B',
    }
})
```
### 浏览器端上报SDK performance-report：
https://github.com/wangweianger/web-performance-report

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