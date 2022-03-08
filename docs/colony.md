# Mongodb集群分片

## 分片的概念：

在MongoDB中，分片集群（sharded cluster）是一种水平扩展数据库系统性能的方法，能够将数据集分布式存储在不同的分片（shard）上，每个分片只保存数据集的一部分，MongoDB保证各个分片之间不会有重复的数据，所有分片保存的数据之和就是完整的数据集。分片集群将数据集分布式存储，能够将负载分摊到多个分片上，每个分片只负责读写一部分数据，充分利用了各个shard的系统资源，提高数据库系统的吞吐量。

## 为什么要分片：

- 解决高并发时系统吞吐量
- 解决垂直扩展的价格昂贵成本，降低成本
- 提高系统的稳定，高可用性
- 提供大数据量时的分布式计算能力
- 解决单机或副本集的磁盘不足
- 解决请求量巨大时的内存不足等

## MongoDB分片集群结构分布：

![](http://www.runoob.com/wp-content/uploads/2013/12/sharding.png "")

上图中主要有如下所述三个主要组件：

- Shard:
用于存储实际的数据块，实际生产环境中一个shard server角色可由几台机器组个一个replica set承担，防止主机单点故障

- Config Server:
mongod配置服务器，存储了整个 ClusterMetadata，其中包括 chunk信息（配置服务器3.4起需要是副本集）。

- Query Routers:
mongos路由器，客户端由此接入，且让整个集群看上去像单一数据库，前端应用可以透明使用。

## 分片实例

> 备注：鉴于成本，以下内容在单机下部署为例，多机部署只需要替换下IP即可

## 分片计划

- 三个Shard分片 端口：27020，27021，27022
- 三个Config服务 端口：27100，27101，27102
- 一个Mongos路由服务 端口：30000

## 创建Shard分片目录

```js
// 创建分片数据和日志存储目录
mkdir -p /data/mongod/s0
mkdir -p /data/mongod/s1
mkdir -p /data/mongod/s2
mkdir -p /data/mongod/log
```

## 启动Shard Server

```js
mongod --dbpath /data/mongod/s0 --logpath /data/mongod/log/s0.log --fork --smallfiles --port 27020 --shardsvr
mongod --dbpath /data/mongod/s1 --logpath /data/mongod/log/s1.log --fork --smallfiles --port 27021 --shardsvr
mongod --dbpath /data/mongod/s2 --logpath /data/mongod/log/s2.log --fork --smallfiles --port 27022 --shardsvr
```

- --dbpath：存储数据目录
- --logpath：存储日志目录
- --smallfiles：是否使用较小的默认文件。默认为false
- --shardsvr：是表示以sharding模式启动Mongodb服务器

> 提示：每个Shard分片也可以是Mongodb副本集

## 创建Config Server目录

```js
mkdir -p /data/mongod/c0
mkdir -p /data/mongod/c1
mkdir -p /data/mongod/c2
```

## 启动Config Server

```js
mongod --dbpath /data/mongod/c0 --logpath /data/mongod/log/c0.log --fork --smallfiles --port 27100 --replSet rs1 --configsvr
mongod --dbpath /data/mongod/c1 --logpath /data/mongod/log/c1.log --fork --smallfiles --port 27101 --replSet rs1 --configsvr
mongod --dbpath /data/mongod/c2 --logpath /data/mongod/log/c2.log --fork --smallfiles --port 27102 --replSet rs1 --configsvr
```

- --replSet：副本集名称，副本集名称必须一致
- --configsvr：是表示以config配置服务启动Mongodb服务器

> 提示：配置服务器需要是Mongodb副本集

## 配置副本集：

```js
// shell 命令进入mongodb
mongo --port 27100
// 使用admin账户
use admin;
// 初始化副本集
rs.initiate({_id:"rs1",members:[{_id:0,host:"127.0.0.1:27100"},{_id:1,host:"127.0.0.1:27101"},{_id:2,host:"127.0.0.1:27102"}]})
// 查看副本集状态
rs.status();
```

> 提示：Mongodb副本集节点的增删非常简单，增加使用 rs.add("127.0.0.1:27103") 删除使用：rs.remove("127.0.0.1:27103")

### 启动Route Process

```js
mongos --logpath /data/mongod/log/mongo.log --port 30000 --fork --configdb rs1/127.0.0.1:27100,127.0.0.1:27101,127.0.0.1:27102
```

- mongos服务不存储数据，因此不需要dbpath
- --configdb是核心配置，表示设定config server的地址列表，格式： 副本集名称/host:prot,host:prot,host:prot 格式。

> 提示：mongos路由服务也可以是副本集

### 配置Sharding分片

```js
// 进入路由服务器
mongo --port 30000

// 添加分片
sh.addShard("127.0.0.1:27020")
sh.addShard("127.0.0.1:27021")
sh.addShard("127.0.0.1:27022")

// 查看分片信息
sh.status();
```

- 设置分片数据库与片键
指定需要分片的数据库


- 设置分片的片键

Mongodb如何分片是一门学问，分的好对数据均衡存储，查询效率有很高的提升，分的不好导致分片不均匀，有的chunk太大，有的太小，查询效率低下，需要好好的实践和琢磨。

Sharding架构下，如果不手动分片，Mongodb不会自动分片，所有数据会存储到一个片中，所以我们希望分片的表必须手动分片。

分片选择的片键首先需要建立索引。

例如：下面对performance数据库的 pagelist 集合进行分片，选择url为片键。

### 1、创建索引

```js
db.pagelist.ensureIndex({"url":1})
```

### 2、设置分片

```js
sh.shardCollection("performance.pagelist",{url:1})
```

- 至此分片完毕。
Mongodb一个chunk默认大小为64M，当数据量大于64M时会重新创建新的chunk储存数据。

## 在zanePerfor (前端性能监控平台)生产环境中使用Mongodb集群分片。

在zanePerfor使用集群分片非常简单，跟单机配置模式是一样的，只需要更改下端口号即可。

- 一：找到项目的 config/config.prod.js文件
更改如下Mongodb配置即可：

```js
// mongodb 服务
// 此处替换 url 参数为链接或副本集方式即可
const dbclients = {
	db3: {
		// 单路由方式
		url: 'mongodb://127.0.0.1:30000/performance',
		// 路由副本集方式
		url: 'mongodb://127.0.0.1:30000,127.0.0.1:30001,127.0.0.1:30002/performance?replicaSet=mongos',
		options: {
			poolSize: 100,
			keepAlive: 10000,
			connectTimeoutMS: 10000,
			autoReconnect: true,
			reconnectTries: 100,
			reconnectInterval: 1000,
		},
	},
};
```

### 二：分片规则
分片规则初期使用hashed分片，例如webpages集合分片方式：

```js
sh.shardCollection("performance.webpages", { "url": "hashed"})
```



