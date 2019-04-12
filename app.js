'use strict';

module.exports = async app => {
    app.models = {};
app.beforeStart(async () => {
    const ctx = app.createAnonymousContext();
    if (app.config.report_data_type === 'kafka') {
        // kafka消费者
        ctx.service.web.reportTask.saveWebReportDatasForKafka();
        ctx.service.wx.reportTask.saveWxReportDatasForKafka();
    } else if (app.config.report_data_type === 'redisPubSub') {
        ctx.service.wx.reportTask.saveWxReportDatasForRedisPubSub();
    }
});
};
