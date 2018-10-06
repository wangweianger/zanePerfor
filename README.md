# 前端性能监控系统

>  * 集成框架选型及其相关配置（已完成）
>  * 主重数据库相关配置开发（已完成）
>  * web网页sdk开发 （已完成）
>  * web端数据库数据后端存储逻辑开发 （已完成）
>  * web端网站性能数据，错误信息，资源加载信息后台逻辑开发（定时任务：已完成）
>  * web端网站PV,UV,IP统计开发（定时任务：已完成）
>  * ip地址库存储逻辑（已完成）
>  * web端上报脚本开发（已完成）
>  * 后台cms界面开发（开发中）
>  * 微信小程序sdk开发 （排期中）
>  * 微信小程序相关后端逻辑开发 （排期中）
>  * 分城市统计性能逻辑开发（排期中）
>  * 所有预警相关业务开发（排期中）
>  * 集群配置 （待考虑）
>  * 性能测试（排期中）

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### web网页sdk 页面性能、资源、错误、ajax，fetch请求上报sdk performance-report：
https://github.com/wangweianger/web-performance-report

### mongodb数据库说明
>  * db1(27017) db1负责用户数据上报的写操作
>  * db2(27018) db2是db1的从库（不一定：有可能db1是从库）负责同步db1的数据 所有的读操作在从库中执行
>  * db3(27019) db3是一个独立的数据库 负责读取db2的数据经过处理 最终展示给用户

### 定时任务说明
>  * web_task定时任务：负责从db2中读取原始数据 经过处理 存储到db3中（网页性能数据，ajax性能数据，用户系统信息，资源性能数据等等）；
>  * web_pvuvip定时任务：负责web端的pvuvip统计 （统计每一分钟的数据进行存储）
>  * ip_task定时任务：负责更新用户的地址信息，根据ip获得城市相关信息，并建立自己的ip地址库

### MongoDB主从复制架构
链接地址：https://blog.seosiwei.com/detail/39

### mongodb可视化工具推荐 Robomongo
链接地址：https://robomongo.org/download