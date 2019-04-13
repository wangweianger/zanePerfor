'use strict';

// 处理数据定时任务
module.exports = app => {
    return {
        schedule: {
            cron: app.config.pvuvip_task_day_time,
            type: 'worker',
            disable: app.config.report_data_type !== 'mongodb',
        },
        // 每天执行一次，定时删除上报的原始数据
        async task(ctx) {
            if (app.config.is_web_task_run || app.config.is_wx_task_run) {
                // 保证集群servers task不冲突
                const preminute = await app.redis.get('delete_task_day_time') || '';
                const value = app.config.cluster.listen.ip + ':' + app.config.cluster.listen.port;
                if (preminute && preminute !== value) return;
                if (!preminute) {
                    await app.redis.set('delete_task_day_time', value, 'EX', 20000);
                    const preminutetwo = await app.redis.get('delete_task_day_time');
                    if (preminutetwo !== value) return;
                }
                if (app.config.is_web_task_run) await ctx.service.remove.deleteDb1WebData(1);
                if (app.config.is_wx_task_run) await ctx.service.remove.deleteDb1WebData(2);
            }
        },
    };
};
