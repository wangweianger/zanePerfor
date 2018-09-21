'use strict';

module.exports = appInfo => {
    const config = exports = {};

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_1536915742607_3127';

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
            password: 'auth',
            db: 0,
        },
    };

    // mongoose配置
    exports.mongoose = {
        url: 'mongodb://127.0.0.1:27017/zane_performance',
        options: {
            server: { poolSize: 20 },
        },
    };

    return config;
};
