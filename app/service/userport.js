'use strict';

const Service = require('egg').Service;

class UseReportService extends Service {

    // 保存用户上报的数据
    saveUseReportData(ctx) {
        console.log(ctx.request);
        return;

        // const report = this.ctx.model.Report();
        // report.app_id = '';
        // report.create_time = '';
        // report.user_agent = '';
        // report.ip = '';
        // report.mark_page = '';
        // report.mark_user = '';
        // report.page_times = '';
        // report.url = '';
        // report.pre_url = '';
        // return report.save();
    }
}

module.exports = UseReportService;
