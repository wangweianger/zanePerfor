'use strict';

module.exports = () => {
    const config = exports = {};

    config.debug = false;

    // 用于安全校验和回调域名根路径 开发路径域名（必填）
    // 线上环境此处替换为项目根域名 例如:https://blog.seosiwei.com (这里需要填写http|https和斜杠等字符)
    config.origin = 'https://www.xxx.com';

    // 百度地图api key
    config.BAIDUAK = 'xxxxxxxxxx';

    // github login
    config.github = {
        client_id: 'xxxxxx',
        client_secret: 'xxxxxx',
        scope: [ 'user' ],
    };

    // ldap
    config.ldap = {
        server: 'ldap://xxx', // ldap服务器地址
        ou: 'xx', // ou
        dc: 'xx', // dc, 非com的另外一层的dc，例如 dc=foobar,dc=com, 这里填 foobar
        isLdap: false, // 是否采用ldap;
    };

    // 新浪微博 login
    config.weibo = {
        client_id: 'xxxxxx', // 微博的App Key
        client_secret: 'xxxxxx', // 微博的App Secret
        scope: [ 'all' ],
    };

    // wechat login
    config.wechat = {
        client_id: 'xxxxxx', // 微信的AppId
        client_secret: 'xxxxxx', // 微信的App Secret
    };

    // redis配置
    config.redis = {
        client: {
            port: 6379, // Redis port
            host: 'xx.xx.xx.xx', // Redis host
            password: 'xxxxxx',
            db: 0,
        },
    };

    // mongodb 服务
    const dbclients = {
        db3: {
            // 单机部署
            url: 'mongodb://127.0.0.1:27017/performance',
            // 副本集 读写分离
            // url: 'mongodb://127.0.0.1:28100,127.0.0.1:28101,127.0.0.1:28102/performance?replicaSet=rs1',
            // 集群分片
            // url: 'mongodb://127.0.0.1:30000/performance',
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
    if (config.report_data_type === 'mongodb') {
        dbclients.db1 = {
            // url: 'mongodb://127.0.0.1:27017,127.0.0.1:27018/performance?replicaSet=performance',
            url: 'mongodb://127.0.0.1:27019/performance',
            options: {
                poolSize: 100,
                keepAlive: 10000,
                connectTimeoutMS: 10000,
                autoReconnect: true,
                reconnectTries: 100,
                reconnectInterval: 1000,
            },
        };
    }

    // mongoose配置
    config.mongoose = {
        clients: dbclients,
    };

    config.security = {
        domainWhiteList: [ 'https://xxx.xx.com' ],
        csrf: {
            enable: false,
            ignore: '/api/v1/report/**',
        },
    };

    return config;
};
