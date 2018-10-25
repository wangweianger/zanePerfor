'use strict';

// 处理数据定时任务
module.exports = app => {
    return {
        schedule: {
            cron: app.config.report_task_time,
            type: 'all',
        },
        // 定时处理上报的数据 db1同步到db3数据
        async task(ctx) {
            if (app.config.is_web_task_run || app.config.is_wx_task_run) {
                // 查询db3是否正常,不正常则重启
                let db3data = false;
                const timer = setTimeout(() => {
                    if (db3data) {
                        db3data = false; clearTimeout(timer);
                    } else {
                        app.restartMongodbs(); clearTimeout(timer);
                    }
                }, 30);
                await ctx.model.System.count({}).exec();
                db3data = true;
            }
            if (app.config.is_web_task_run) ctx.service.web.webReportTask.saveWebReportDatas();
            if (app.config.is_wx_task_run) ctx.service.wx.reportTask.saveWxReportDatas();
        },
    };
};
