'use strict';

module.exports = () => {
    const config = exports = {};

    // use for cookie sign key, should change to your own and keep security
    config.keys = '_1536915742607_3127';

    // add your config here
    config.middleware = [];

    config.name = '性能监控系统';

    config.description = '性能监控系统';

    // debug 为 true 时，用于本地调试
    config.host = 'http://performance.seosiwei.com';

    // 务必修改config.debug = true;
    config.session_secret = 'node_club_secret';

    // web网页端执行定时任务时间
    config.web_tash_time = '10s';

    // ejs模板
    config.view = {
        defaultExtension: '.html',
        mapping: {
            '.html': 'ejs',
        },
    };
    config.ejs = {
        layout: 'layout.html',
    };

    // redis配置
    config.redis = {
        client: {
            port: 6379, // Redis port
            host: '127.0.0.1', // Redis host
            password: '',
            db: 0,
        },
    };

    // mongoose配置
    config.mongoose = {
        clients: {
            // 主库:负责存储数据 从库：复责读取数据
            db1: {
                url: 'mongodb://127.0.0.1:27017,127.0.0.1:27018/performance?replicaSet=performance',
                options: {
                    mongos: true,
                    server: { poolSize: 20 },
                },
            },
            // 定时任务执行完之后存储到数据库3
            db3: {
                url: 'mongodb://127.0.0.1:27019/performance',
                options: {
                    server: { poolSize: 20 },
                },
            },
        },
    };

    config.bodyParser = {
        jsonLimit: '10mb',
        formLimit: '10mb',
    };

    config.security = {
        domainWhiteList: [ 'http://127.0.0.1:18090' ],
        csrf: {
            ignore: '/api/v1/report/**',
        },
    };

    config.cors = {
        origin: '*',
        allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    };

    config.onerror = {
        all(err, ctx) {
            // 统一错误处理
            ctx.body = JSON.stringify({
                code: 1001,
                desc: err.toString().replace('Error: ', ''),
            });
            ctx.status = 200;
            // 统一错误日志打印
            console.log('----------error信息begin----------');
            console.log(err);
            console.log('----------error信息end----------');
        },
    };

    return config;
};
