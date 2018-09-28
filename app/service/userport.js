'use strict';

const Service = require('egg').Service;

class UseReportService extends Service {

    // 保存用户上报的数据
    saveUseReportData(ctx) {
        const query = ctx.request.body;
        const ip = ctx.get('X-Real-IP') || ctx.get('X-Forwarded-For') || ctx.ip;

        const report = ctx.model.Usereport();
        report.app_id = '';
        report.create_time = '';
        report.user_agent = query.appVersion;
        report.ip = ip;
        report.mark_page = '';
        report.mark_user = '';
        report.page_times = new Date(query.time);
        report.url = query.page;
        report.pre_url = '';
        const result = report.save();

        result.then((data)=>{
            console.log(data);
        })

        console.log(result);
        return result;
    }
}

module.exports = UseReportService;
