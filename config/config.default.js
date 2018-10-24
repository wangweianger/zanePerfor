'use strict';

module.exports = () => {
    const config = exports = {};

    // use for cookie sign key, should change to your own and keep security
    config.keys = '_123456789';

    // add your config here
    config.middleware = [];

    config.name = '性能监控系统';

    config.description = '性能监控系统';

    // debug 为 true 时，用于本地调试
    config.host = '';

    // 务必修改config.debug = true;
    config.session_secret = 'node_performance_secret';

    // web浏览器端定时任务是否执行
    config.is_web_task_run = true;

    // web浏览器端定时任务是否执行
    config.is_wx_task_run = true;

    // db1与db3数据库同步每分钟执行一次
    config.report_task_time = '0 */1 * * * *';

    // 执行pvuvip定时任务的时间间隔 每分钟定时执行一次
    config.pvuvip_task_minute_time = '0 */1 * * * *';

    // 执行pvuvip定时任务的时间间隔 每天定时执行一次
    config.pvuvip_task_day_time = '0 0 0 */1 * *';

    // 执行ip地理位置转换的定时任务 每分钟定时执行一次
    config.ip_task_time = '0 */1 * * * *';

    // db3同步db1上报数据线程数
    config.report_thread = 10;

    // 更新用户上报IP对应的城市信息线程数
    config.ip_thread = 10;

    // mongodb重启shell,如果mongodb进程kill了，请求不了数据库时重启（可选填）
    // config.mongodb_restart_sh = [ '/usr/local/etc/start.sh' ];
    config.mongodb_restart_sh = [ '/data/mongodb/start.sh' ];

    // 百度地图api key
    config.BAIDUAK = '36UI4dIyIfCVKQWW7hoeSIuM';

    // 分页条数
    config.pageSize = 50;

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
    // test
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
                // url: 'mongodb://127.0.0.1:27017,127.0.0.1:27018/performance?replicaSet=performance',
                url: 'mongodb://127.0.0.1:27017/performance',
                options: {
                    server: {
                        auto_reconnect: true,
                        poolSize: 500,
                    },
                },
            },
            // 定时任务执行完之后存储到数据库3
            db3: {
                // url: 'mongodb://127.0.0.1:27018,127.0.0.1:27019,127.0.0.1:27020/performance?replicaSet=performance',
                url: 'mongodb://127.0.0.1:27019/performance',
                options: {
                    server: {
                        auto_reconnect: true,
                        poolSize: 500,
                    },
                },
            },
        },
    };

    config.bodyParser = {
        jsonLimit: '1mb',
        formLimit: '1mb',
    };

    config.security = {
        domainWhiteList: [ 'https://performance.niwoning.com', 'http://127.0.0.1:18090' ],
        csrf: {
            enable: false,
            ignore: '/api/v1/report/**',
        },
    };

    config.cors = {
        origin: '*',
        allowMethods: 'GET,PUT,POST,DELETE',
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
