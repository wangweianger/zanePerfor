'use strict';

// 处理数据定时任务
module.exports = app => {
    return {
        schedule: {
            cron: app.config.ip_task_time,
            type: 'all',
        },
        // 定时处理上报的数据
        async task(ctx) {
            await ctx.service.ipTask.saveGetIpDatas();
        },
    };
};
