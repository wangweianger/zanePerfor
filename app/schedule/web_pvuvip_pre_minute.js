'use strict';

// 执行pvuvip定时任务的时间间隔 每天定时执行一次
module.exports = app => {
    return {
        schedule: {
            cron: app.config.pvuvip_task_minute_time,
            type: 'all',
        },
        // 定时处理上报的数据
        async task(ctx) {
            await ctx.service.web.webPvuvipTask.getWebPvUvIpByMinute();
        },
    };
};
