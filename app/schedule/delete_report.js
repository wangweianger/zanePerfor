'use strict';

// 处理数据定时任务
module.exports = app => {
    return {
        schedule: {
            cron: app.config.pvuvip_task_day_time,
            type: 'all',
        },
        // 每天执行一次，定时删除上报的原始数据
        async task(ctx) {
            if (app.config.is_web_task_run) await ctx.service.remove.deleteDb1WebData();
        },
    };
};
