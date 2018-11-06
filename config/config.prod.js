'use strict';

module.exports = () => {
    const config = exports = {};

    // 百度地图api key
    config.BAIDUAK = '36UI4dIyIfCVKQWW7hoeSIuM';

    // redis配置
    config.redis = {
        client: {
            port: 6379, // Redis port
            host: 'xx.xx.xx.xx', // Redis host
            password: 'xxxxxx',
            db: 0,
        },
    };

    // mongoose配置
    config.mongoose = {
        clients: {
            // 主库:负责存储数据 从库：复责读取数据
            db1: {
                // url: 'mongodb://127.0.0.1:27017,127.0.0.1:27018/performance?replicaSet=performance',
                url: 'mongodb://127.0.0.1:27017/performance',
                options: {
                    poolSize: 100,
                    keepAlive: 10000,
                    connectTimeoutMS: 10000,
                    autoReconnect: true,
                    reconnectTries: 100,
                    reconnectInterval: 1000,
                },
            },
            // 定时任务执行完之后存储到数据库3
            db3: {
                // url: 'mongodb://127.0.0.1:27018,127.0.0.1:27019,127.0.0.1:27020/performance?replicaSet=performance',
                url: 'mongodb://127.0.0.1:27019/performance',
                options: {
                    poolSize: 100,
                    keepAlive: 10000,
                    connectTimeoutMS: 10000,
                    autoReconnect: true,
                    reconnectTries: 100,
                    reconnectInterval: 1000,
                },
            },
        },
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
