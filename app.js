'use strict';

module.exports = async app => {
    app.models = {};
    if (app.config.report_data_type === 'kafka') {
        app.beforeStart(async () => {
            // kafka消费者
            const ctx = app.createAnonymousContext();
            ctx.service.web.reportTask.saveWebReportDatasForKafka();
            ctx.service.wx.reportTask.saveWxReportDatasForKafka();
        });
    }
};
