'use strict';

// 处理数据定时任务
module.exports = app => {
    return {
        schedule: {
            cron: app.config.ip_task_time,
            type: 'all',
        },
        // 定时处理ip城市地理位置信息
        async task(ctx) {
            if (app.config.is_web_task_run) await ctx.service.web.webIpTask.saveWebGetIpDatas();
        },
    };
};
