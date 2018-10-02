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
            // 主数据库 负责存储数据
            db1: {
                url: 'mongodb://127.0.0.1:27017/performance',
                options: {
                    server: { poolSize: 20 },
                },
            },
            // 重数据库 复制读取数据
            db2: {
                url: 'mongodb://127.0.0.1:27018/performance',
                options: {},
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
            // 在此处定义针对所有响应类型的错误处理方法
            // 注意，定义了 config.all 之后，其他错误处理方法不会再生效
            console.log('----------error信息begin----------');
            console.log(err);
            console.log('----------error信息end----------');
            ctx.body = 'error';
            ctx.status = 500;
        },
        html(err, ctx) {
            // html hander
            ctx.body = '<h3>error</h3>';
            ctx.status = 500;
        },
        json(err, ctx) {
            // json hander
            ctx.body = { message: 'error' };
            ctx.status = 500;
        },
    };

    return config;
};
