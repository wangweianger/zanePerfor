# 单机部署入门体验

## 一：安装Mongodb数据库

> 提示：安装Mongodb的教程网上非常之多，我这里也不重复的编写，直接推荐几篇文章

- 菜鸟教程：http://www.runoob.com/mongodb/mongodb-osx-install.html

- Mongodb官网：https://docs.mongodb.com/manual/administration/install-enterprise/

- Mongo中文社区：http://www.mongoing.com/docs/administration/install-community.html

Mongodb可视化工具推荐Robomongo,非常好用！

- Robomongo：https://robomongo.org/download

## 参考：一份最基础的Mongodb配置
```js
processManagement:
	fork: true
systemLog:
	destination: file
	path: /usr/local/var/log/mongodb/mongo27017.log
	logAppend: true
storage:
	dbPath: /Users/MacBook/mongodb/mongodb27017
net:
	bindIp: 127.0.0.1
	port: 27017
```

### Mongodb各项配置含义参考链接：

- 官网Config：https://docs.mongodb.com/manual/reference/configuration-options/index.html

- 会煮咖啡的猫咪：https://www.jianshu.com/p/f9f1454f251f


## 二：安装Redis数据库

> 提示：安装Redis的教程网上也非常之多，以下链接可参考

- 菜鸟教程：http://www.runoob.com/redis/redis-install.html

- Redis中文网：http://www.redis.net.cn/tutorial/3503.html

Redis可视化工具推荐Redis Desktop Manager,也很好用！

官网下载比较困难，对于windows和Mac收费，这里推荐使用我收藏的安装文件安装

- Mac端链接：链接: https://pan.baidu.com/s/1Z1i22OhfSMh3e4-3E5Q5WA 提取码: 8pd6

- Windows端链接：链接: https://pan.baidu.com/s/1CbHIXdmPuYuEBfk7rbCjRw 提取码: xkak

### 参考：Redis Config参考配置含义，推荐链接

- 官网Config：https://redis.io/topics/config

- 菜鸟教程：http://www.runoob.com/redis/redis-conf.html

## 三：Node.js服务部署

### 一：下载项目文件

```js
git clone https://github.com/wangweianger/zanePerfor.git
```

### 二：安装依赖

```js
// 查看node版本 node版本需要 >=8.0.0	
node -v
// 安装依赖
npm install
```

> 如果你的node版本低于8.0.0，请升级

> 推荐nvm安装node,Linux安装可参考 LINUX系统安装nvm 快速搭建Nodejs开发环境

### 三：配置项目Config

配置项目端口和Host (本地开发默认即可)

```js
config.cluster = {
	listen: {
		port: 7001,
		hostname: '127.0.0.1',
		ip: address.ip(),
	},
};
```

配置Redis Config（本地开发默认即可）

```js
config.redis = {
	client: {
		port: 6379, // Redis port
		host: '127.0.0.1', // Redis host
		password: '',
		db: 0,
	},
};
```

配置Mongodb服务（本地开发默认即可）

```js
const dbclients = {
	db3: {
		url: 'mongodb://127.0.0.1:27019/performance',
		options: {
			poolSize: 20,
		},
	},
};
```
项目各配置项含义参考说明

## 四：启动服务

```js
// 本地开发
npm run dev

// 生产环境
npm run build
```

## 四：登录后台创建应用

### 一：浏览器打开启动好的应用链接：http://127.0.0.1:7001
如果你部署成功会看到如下登录界面

注册账号（系统默认admin为管理员，其他账号全是普通用户）
注册号之后会自动登录系统，点击添加应用，请选择你的应用类型（这里分为WEB 和 微信小程序两种类型应用）

填写应用名称和应用域名

## 五：下载SDK并进行数据的上报

以上步骤完成你会看到如下的部署配置

SDK使用文档
- WEB端SDK及其使用文档：https://github.com/wangweianger/web-report-sdk
- 小程序端SDK及其使用文档：https://github.com/wangweianger/wx-report-sdk

### 多页面部署案例：
```js
// 头部引入sdk脚本
<\/script src="/js/performance-report-default.min.js"><\/script>
<\script>
	Performance({
		domain: 'http://127.0.0.1:7001/api/v1/report/web',
		add: {
			// 建好应用的appId
			appId: 'xxxxxxxxxxxxxx'
		}
	})
<\/script>
```

### 单页面部署案例：

- 一：项目下新建 performance.js 文件，文件内容如下

```js
const Performance = require('common/js/performance-report.min')
try{
	Performance({
		domain:'https://127.0.0.1:7001/api/v1/report/web',
		add:{
			// 建好应用的appId
			appId: 'xxxxxxxxxxxxxx'
		}
	})
} catch (e) {}
```

- 二：项目main.js入口文件顶部引入SDK插件

```js
// main.js 单页面入口文件
// 引入jdk
require('./performance')
// 其他配置项
import Vue from 'vue'
import App from './app'
import VueRouter from 'vue-router'
import routes from './router'
import filter from './filter'
......
```

- 三：webpack配置加入性能SDK

```js
// 入口配置
entry: {
	performance:path.resolve(__dirname, '../src/performance.js'),
	// 其他配置项
	...
},
```

## 六：大功告成，开始第一次的试用吧。
其他说明：新建应用后，第一次需要给用户分配权限才会显示应用
