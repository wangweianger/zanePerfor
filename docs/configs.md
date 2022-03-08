# config重要配置说明

## 一：定时任务启动配置
```js
// 浏览器端是否开启定时任务，如果不开启，所有的web相关的统计将不会执行（pv,uv,ip,top,省流量统计等）				
config.is_web_task_run = true;

// 小程序端是否开启定时任务，如果不开启，所有的web相关的统计将不会执行（pv,uv,ip,top,省流量统计等）
config.is_wx_task_run = true;
```

> 备注：此配置项可以把整个项目拆分成2个项目，针对于web的项目和针对于小程序的项目，可以按需配置

## 二：使用redis消息队列还是使用mongodb储存上报原始数据

```js
// 此配置有两个值：redus || mongodb
// 如果使用redis则上报的原始数据使用redis消息队列存储
// 如果使用mongodb则上报的原始数据使用mongodb数据库储存
config.report_data_type = 'redis';
备注：此配置项对上报的方式有很大的影响，推荐使用 redis 消息队列（配置更简单，性能更强）

// 如果	config.report_data_type = 'redis'; 则需要配置以下参数
config.redis_consumption = {
	// 消费者消费生产数据的定时任务
	task_time: '*/20 * * * * *',

	// 每次定时任务消费线程数(web端)
	thread_web: 1000, // 此配置每次回消费 60/20 * 1000 = 3000 条数据

	// 每次定时任务消费线程数(wx端) （如果值为0则不执行消费任务）
	thread_wx: 0,

	// 消息队列池限制数, 0：不限制 number: 限制条数 高并发时服务优雅降级方案
	total_limit_web: 100000,
	total_limit_wx: 100000,
};
```

> 备注：(total_limit_web|total_limit_wx)只有消息队列时可用，若不想限制填为0即可

## 三：定时任务时间说明

```js
// 此配置于	config.report_data_type = 'mongodb' 相关联，表示每分钟db3从db1同步数据的时间间隔，默认1s
config.report_task_time = '0 */1 * * * *';

// 每分钟定时统计任务 （包括：pv,uv,ip,top排行）
config.pvuvip_task_minute_time = '0 */1 * * * *';

// 每天定时统计任务 （包括：pv,uv,ip,top排行，省份流量统计排行）
config.pvuvip_task_day_time = '0 0 0 */1 * *';

// ip解析为城市信息定时任务时间间隔
config.ip_task_time = '0 */1 * * * *';
```

## 四：IP定时任务解析器使用redis还是mongodb

```js
// 此配置有两个值 redus || mongodb，标识ip解析为城市地址是查询的数据方式
config.ip_redis_or_mongodb = 'redis'
```

> 备注：ip解析为城市在使用数据库查询之前会优先去本地缓存文件查询一遍，如果没有才会去数据库匹配

# 五：IP定时任务解析器使用本地缓存设置

```js
// 缓存IP地址对应城市信息的本地json文件，优先级高于	config.ip_redis_or_mongodb 配置
config.ip_city_cache_file = {
	web: 'web_ip_city_cache_file.txt',
	wx: 'wx_ip_city_cache_file.txt',
};
```

## 六：IP定时任务解析器使用redis还是mongodb

```js
// 此配置表示 db3同步db1的线程数 只有当 config.report_data_type = 'mongodb' 时才会生效
config.report_thread = 10; // 此配置同步数据相当于10个线程在跑

// ip地址解析为城市信息线程数 数字越大每次跑的数据越多
config.ip_thread = 10; // 此配置默认每次跑 10 * 60 = 600 条
```

## 七：数据库和servers出现意外时的重启脚本

```js
config.shell_restart = {
	// mongodb重启shell,如果mongodb服务崩溃了，服务重启脚本（可选填）
	mongodb: [ '/data/performance/mongodb-restart.sh' ],

	// node.js服务重启shell,mongodb重启时，数据库连接池有可能会断，这时重启服务（可选填）
	servers: [ '/data/performance/servers-restart.sh' ],
};
```

> 备注：此配置一般用在单机模式下的保证服务正常方案，集群模式下可不填写
> 程序中有一套检测数据库是否正常机制，如果检测不正常则会重启db，和servers，一直重复直到重启成功，以此保证单机的高可用方案