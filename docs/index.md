# zanePerfor是什么?

## zanePerfor是一个服务于性能监控的业务平台项目，目前实现了浏览器，微信小程序的相关基础性能统计。

> 备注：zanePerfor目前还不完善，处于开发初期，我会长期的维护和升级

> 展望：zanePerfor的目标是解决中小应用的性能统计，支持通用的数据统计和定制化的统计开发，解决高并发下的应用高可用

> 性能：目前架构理论上来说可支持每日(百万、千万)级PV，未来会持续开发和优化

## zanePerfor目前实现了哪些功能？

### 浏览器端(WEB)
- 页面级的性能上报（多页面 || 单页面应用程序通用）
- 页面AJAX性能上报
- 页面所有加载资源性能上报（图片,js,css）
- 页面所有错误信息上报（js,css,ajax）
- 微信小程序端
- path路径对应的AJAX性能上报
- 小程序错误信息上报（js,ajax,img）
- 用户设备信息及其网络信息上报
- 后端界面展示功能（web,小程序通用）
- 统计每分钟应用的PV,UV,IP信息，统计每天的PV,UV,IP,跳出率，用户访问平均深度
- 统计实时和每天的应用top最高访问排行，跳出率最高排行
- 统计实时和每天的全国省份流量热力图
- 统计每个用户每次访问的行为轨迹
- 下面用图来展示实现的大致功能
- 实时PV,UV,IP统计

### 单页面性能详情列表
![](https://github.com/wangweianger/zanePerfor/blob/master/demo/05.png)

### 单个AJAX性能详情
![](https://github.com/wangweianger/zanePerfor/blob/master/demo/06.png)

### 用户轨迹跟踪
![](https://github.com/wangweianger/zanePerfor/blob/master/demo/09.png)

### 省份实时流量统计
![](https://github.com/wangweianger/zanePerfor/blob/master/demo/12.png)
