'use strict';

// 处理数据定时任务
module.exports = app => {
    return {
        schedule: {
            cron: app.config.ip_task_time,
            type: 'worker',
            disable: !(app.config.is_web_task_run || app.config.is_wx_task_run),
        },
        // 定时处理ip城市地理位置信息
        async task(ctx) {
            // 保证集群servers task不冲突
            const preminute = await app.redis.get('ip_task_time') || '';
            const value = app.config.cluster.listen.ip + ':' + app.config.cluster.listen.port;
            if (preminute && preminute !== value) return;
            if (!preminute) {
                await app.redis.set('ip_task_time', value, 'EX', 20000);
                const preminutetwo = await app.redis.get('ip_task_time');
                if (preminutetwo !== value) return;
            }
            if (app.config.is_web_task_run) await ctx.service.web.ipTask.saveWebGetIpDatas();
            if (app.config.is_wx_task_run) await ctx.service.wx.ipTask.saveWxGetIpDatas();
        },
    };
};
