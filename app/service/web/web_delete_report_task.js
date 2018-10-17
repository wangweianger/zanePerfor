'use strict';
const parser = require('cron-parser');
const Service = require('egg').Service;
class DeleteReportService extends Service {

    // 定时删除原始上报数据 一天删一次
    async webDeleteReportTaskDatas() {
        const interval = parser.parseExpression(this.app.config.pvuvip_task_day_time);
        interval.prev();
        interval.prev();
        const endTime = new Date(interval.prev().toString());

        const query = { create_time: { $lt: endTime } };

        await this.ctx.model.Web.WebReport.remove(query).exec();
    }
}

module.exports = DeleteReportService;
