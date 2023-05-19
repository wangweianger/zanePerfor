# zanePerfor一款完整、高性能、高可用的前端性能监控和统计平台

[![Node](https://img.shields.io/badge/node-8.9.0~10.15.1-green.svg?style=plastic)](https://nodejs.org/en/)
[![Vue](https://img.shields.io/badge/vue-2.0+-blue.svg?style=plastic)](https://cn.vuejs.org/)
[![Egg](https://img.shields.io/badge/egg-2.0-green.svg?style=plastic)](https://eggjs.org/)
[![Mogodb](https://img.shields.io/badge/mogodb-4.0+-brightgreen.svg?style=plastic)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/redis-5.0+-green.svg?style=plastic)](https://redis.io/)

## 开发功能进度说明
>
> * 集成框架选型及其相关配置（已完成）
> * 主重数据库相关配置开发（已完成）
> * web网页sdk开发（已完成）
> * web端数据库数据后端存储逻辑开发 （已完成）
> * web端网站性能数据，错误信息，资源加载信息后台逻辑开发（定时任务：已完成）
> * web端网站PV,UV,IP统计开发（定时任务：已完成）
> * ip地址库存储逻辑(多种缓存策略：本地文件缓存，redis缓存，mongodb缓存)（已完成）
> * web端上报脚本开发（已完成）
> * 分城市统计性能逻辑开发（已完成）
> * 浏览器端后台cms界面开发（已完成）
> * 微信小程序sdk开发 （已完成）
> * 微信小程序相关后端逻辑开发 （已完成）
> * 微信小程序后台cms界面开发（已完成）
> * 微信分城市统计性能逻辑开发（已完成）
> * 用户行为漏斗分析 即用户行为分析（已完成）
> * TOP性能统计（已完成）
> * 省市流量统计热力图分析（已完成）
> * 上报方式新增redis 消息队列（已完成）
> * 索引优化（已完成）
> * Mongodb副本集读写分离开发（已完成）
> * 数据库分表（即分集合）针对于apges,ajaxs,errors,resource,enviroment大数据量表分表，不同应用存储到不同的表中（已完成）
> * Mongodb集群配置 （已完成）
> * github第三方登录 （已完成）
> * 新浪微博第三方登录 （已完成）
> * 微信授权第三方登录 （已完成）
> * Mongodb集群分片开发（优化中）
> * 项目性能优化（已完成）
> * 邮件触发服务开发（已完成)
> * 每日日报邮件发送（已完成）
> * 页面后续操作过程中出现的Error错误、Ajax性能、资源加载的上报（已完成）
> * 所有预警相关业务开发（开发中）
> * Kafka消息队列的引入和使用 （已完成）
> * 应用突破历史流量峰值时触发邮件通知、开发流量预警功能（已完成）
> * 用户访问实时消费流量统计功能(ajax，页面，资源)（已完成)

## 使用

简单尝试推荐使用 Docker 运行

### 1. 安装 Docker

Docker 官网：<https://www.docker.com/>

docker 官网中下载适合自己系统得 Docker 进行安装。

* 验证 Docker 是否安装成功

```ts
Docker --version
```

### 2. 推荐安装 Docker Desktop

Docker 安装成功之后，推荐安装 Docker Desktop

Desktop 安装地址：<https://www.docker.com/products/docker-desktop/>

### 3. 安装 docker-compose

docker-compose 下载地址：<https://github.com/docker/compose/releases>

* 在 Assets 中下载对应的解压包

* 验证是否安装成功

```ts
docker-compose --version
```

### 4. 下载代码到本地

```ts
git clone git@github.com:wangweianger/zanePerfor.git
```

### 5.修改 start-docker-compose.sh 里的 hostIP 为内网 IP

⚠️ 不能是 `127.0.0.1` 或 `localhost`

* 获取 IP 地址方式

> cmd 窗口中运行 ipconfig, IPv4 地址即内网 IP

### 6. 启动 docker-compose

> 方式一：

```sh
# 项目所在目录
./start-docker-compose.sh
```

> 方式二

```sh
export hostIP='自己的内网IP' && docker-compose up -d --build
```

### 6.启动 web 开发环境

```sh
# 安装依赖
yarn install

# 启动本地服务
yarn dev
```

## 发布生产

维护生产环境配置文件 `./config/config.prod.js`

```ts
yarn start
```

## 项目开发文档

* [zanePerfor是什么?](https://github.com/wangweianger/zanePerfor/blob/master/docs/index.md)
* [zanePerfor在高流量高并发项目下的架构配置建议实践说明](https://juejin.cn/post/6844903815255179272)
* [系统高可用之Mongodb集群分片架构](https://juejin.cn/post/6844903714369568782)
* [系统高可用之Mongodb副本集读写分离架构](https://juejin.cn/post/6844903713715273742)
* [github 登录授权说明](https://github.com/wangweianger/zanePerfor/blob/master/docs/github.md)
* [zanePerfor中集成kafka的开发实践和限流优雅降级](https://juejin.cn/post/6844903766139879438)

## 项目说明

* 项目已部署到正式环境，并已稳定运行一段时间，请放心使用。
* 前期推荐使用单机数据库或者Mongodb副本集架构，后期根据自身需求考虑是否使用集群分片
* 目前4核8G单机服务器大概能支撑每日50-100W的pv,8核16G单机服务器可支撑100W-500W的PV流量
* 如果项目日PV超千万，需要Redis集群,Mongodb集群分片的部署方式
* 项目后台查询性能增加合适的索引之后，千万以上的数据量可在100ms-2s之内查询出来，平均100-300ms(单机/副本集)

## 浏览器端使用说明

### 方式一

在管理后台创建项目之后有详细的使用文档，参考使用即可。

### 方式二

* 使用SDK方式上报数据

```js
// install
yarn add web-report

// 使用
import { Performance, axiosReport, defaultReport, fetchReport, jqueryReport } from 'web-report'

defaultReport({
    domain:'http://report.com/api/v1/report/web',
    add:{
        appId:'D3D9B9AA45B56F6E424F57EFB36B0XXX',
    }
})
```

* web-report SDK详细文档: <https://github.com/wangweianger/web-report-sdk>
## Vue 项目使用SDK：

- 进去app目录下public文件夹，解压web-report-vue-min.zip。将里面的文件复制到自己项目下,找到public文件夹或者根目录文件夹下的index.html。添加以下代码:

- ```js
   <script src ="./web-report-vue-min.js"></script>
   <script defer>
   window.Performance({
      domain: `http://report.com/api/v1/report/web`, //此处的report.com指你自己部署的域名，假如是本机启动填127.0.0.1
      add: {
        appId: "ZzdSi3P1683682161087XXX",
     },
   });
  </script>
  ```

​	这里向大家分享一下不同环境下使用的方法: 

- Vue2: 可以在**.env.build**等环境配置文件配置环境变量，例如： VUE_APP_BASE_URL=/abc/index

```js
<script src="<%= VUE_APP_BASE_URL %>/cdn/sdk/web-report-axios.min.js"></script>
<script defer>
window.Performance({
        domain: '<%= VUE_APP_BASE_URL %>/api/v1/report/web',
        add: {
          appId: 'Ac3pkKd1675993494568',
        },
      });
</script>
```

- Vue3: 可以在**.env.build**等环境配置文件配置环境变量，例如： VITE_BUILD_HOST = 'http://xxxxx:7001'

- 然后在Vite.config.ts中新增插件：createHtmlPlugin -> npm install createHtmlPlugin -D。然后在plugins中配置以下代码

  ```js
  createHtmlPlugin({
          minify: true,
          pages: [
            {
              // entry: "src/main.ts",
              filename: "index.html",
              template: "index.html",
              injectOptions: {
                data: {
                  // title: "index",
                  injectScript: `<script type ="module" src="/src/utils/inject.ts" defer></script>`,
                },
              },
            },
          ],
        }),
  ```

  在src下的utils文件夹新增文件inject.ts

  ```js
  window.Performance({
      domain: `${window._process_env.VITE_BUILD_HOST}/api/v1/report/web`,
      add: {
        appId: "ZzdSi3P1XXXX2161087",
      },
    });
  ```

  这样就可以动态的引入各个环境的域名前缀，部署到各个环境啦。

## 微信小程序端使用说明

* 管理后台创建项目后下载sdk，引入到小程序的 app.js 最顶部

```js
// 微信小程序 app.js头部引入sdk
const wxRepotSdk = require('./utils/wx-report-sdk.min');

new wxRepotSdk({
    domain:'http://test.com',
    add:{
        appId:'56F6E424F57EFB36B0XXX'
    }
})
```

* wx-report-sdk SDK详细文档：<https://github.com/wangweianger/wx-report-sdk>

## 展示效果

![](https://github.com/wangweianger/zanePerfor/blob/master/demo/01.png "")
![](https://github.com/wangweianger/zanePerfor/blob/master/demo/02.png "")
![](https://github.com/wangweianger/zanePerfor/blob/master/demo/03.png "")
![](https://github.com/wangweianger/zanePerfor/blob/master/demo/04.png "")
![](https://github.com/wangweianger/zanePerfor/blob/master/demo/09.png "")
![](https://github.com/wangweianger/zanePerfor/blob/master/demo/012.png "")
