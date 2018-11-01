'use strict';

// 执行pvuvip定时任务的时间间隔
module.exports = app => {
    return {
        schedule: {
            cron: app.config.pvuvip_task_day_time,
            type: 'worker',
        },
        // 定时处pv，uv,ip统计信息 每天执行一次
        async task(ctx) {
            if (app.config.is_web_task_run) await ctx.service.web.webPvuvipTask.getWebPvUvIpByDay();
            if (app.config.is_wx_task_run) await ctx.service.wx.pvuvipTask.getWxPvUvIpByDay();
        },
    };
};
