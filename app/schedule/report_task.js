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
            if (app.config.is_web_task_run) await ctx.service.web.webReportTask.saveWebReportDatas();
        },
    };
};
