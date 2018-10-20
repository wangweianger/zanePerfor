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
>  * 微信小程序sdk开发 （开发中）
>  * 微信小程序相关后端逻辑开发 （开发中）
>  * 微信小程序后台cms界面开发（开发中）
>  * 微信分城市统计性能逻辑开发（排期中）
>  * 用户行为漏斗分析（排期中）
>  * 所有预警相关业务开发（排期中）
>  * 集群配置 （待考虑）
>  * 性能测试（排期中）

## 服务架构说明
### 一：技术选型说明
* egg.js,ejs,mongoose,redis,vue.js,jquery.js

### 二：mongodb数据库说明
* db1(27017) db1负责用户数据上报的写操作
* db2(27018) db2是db1的从库（不一定：有可能db1是从库）负责同步db1的数据 所有的读操作在从库中执行
* db3(27019) db3是一个独立的数据库 负责读取db2的数据经过处理 最终展示给用户

### 三：定时任务说明
* web_task定时任务：负责从db2中读取原始数据 经过处理 存储到db3中（网页性能数据，ajax性能数据，用户系统信息，资源性能数据等等）；
* web_pvuvip定时任务：负责web端的pvuvip统计 （统计每一分钟的数据进行存储）
* ip_task定时任务：负责更新用户的地址信息，根据ip获得城市相关信息，并建立自己的ip地址库

### 四：性能保证说明
* 读写数据库分离，即上报用db1数据库，读取数据为db3数据库
* db1与db3数据同步时间为1分钟一次，同步时根据自己需求开启多线程同步（默认10个线程）
* 百度地图支持每天10万限量和1s 100次并发量，程序中同步地理位置优先使用自身数据库IP匹配若匹配不到则请求百度地图api，因此请求量不大，本地数据库ip只匹配前三位标识（例如：212.21.22），同步ip地址信息也开启了多线程（默认为20，不建议调的太大）
* 后台cms界面接口为了保证大数据量的请求效率，求平均数的所有列表接口开启了多线程，线程数由pageSize决定，这样查询性能更高效。
* 大数据量的列表接口请求总条数和分页列表信息量接口采用异步请求，减少请求耗时
* 对相关表建立了单索引和复核索引的优化

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
### web网页sdk 页面性能、资源、错误、ajax，fetch请求上报sdk performance-report：
https://github.com/wangweianger/web-performance-report

## 旧版完整前端性能监控系统
https://github.com/wangweianger/web-performance-monitoring-system

## 开发
```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```
## 服务架构探索
* 针对于不同的项目，不同的并发量，后期关于项目服务架构我会写一篇独立的文章（待写...）。
* MongoDB主从复制架构 https://blog.seosiwei.com/detail/39

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