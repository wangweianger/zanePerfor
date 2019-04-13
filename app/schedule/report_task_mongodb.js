'use strict';

// 处理数据定时任务
module.exports = app => {
    return {
        schedule: {
            cron: app.config.report_task_time,
            type: 'worker',
            disable: app.config.report_data_type !== 'mongodb',
        },
        // 定时处理上报的数据 db1同步到db3数据
        async task(ctx) {
            if (app.config.is_web_task_run || app.config.is_wx_task_run) {
                // 保证集群servers task不冲突
                const preminute = await app.redis.get('report_task_for_mongodb') || '';
                const value = app.config.cluster.listen.ip + ':' + app.config.cluster.listen.port;
                if (preminute && preminute !== value) return;
                if (!preminute) {
                    await app.redis.set('report_task_for_mongodb', value, 'EX', 20000);
                    const preminutetwo = await app.redis.get('report_task_for_mongodb');
                    if (preminutetwo !== value) return;
                }
                // 查询db3是否正常,不正常则重启
                try {
                    const result = await ctx.model.System.count({}).exec();
                    app.logger.info(`-----------db3--查询db3数据库是否可用----${result}------`);

                    if (app.config.is_web_task_run) ctx.service.web.reportTask.saveWebReportDatasForMongodb();
                    if (app.config.is_wx_task_run) ctx.service.wx.reportTask.saveWxReportDatasForMongodb();
                } catch (err) {
                    app.restartMongodbs('db3', ctx, err);
                }
            }
        },
    };
};
