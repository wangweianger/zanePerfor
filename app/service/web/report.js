'use strict';

const Service = require('egg').Service;

class WebReportService extends Service {

    // 保存用户上报的数据
    async saveWebReportData(ctx) {
        const query = ctx.request.body;
        const ip = ctx.get('X-Real-IP') || ctx.get('X-Forwarded-For') || ctx.ip;

        const system = await this.service.system.getSystemForAppId(query.appId);
        if (!system) return {};
        if (system.is_use !== 0) return {};

        const report = ctx.model.Web.WebReport();
        report.app_id = query.appId;
        report.create_time = query.time;
        report.user_agent = ctx.headers['user-agent'];
        report.ip = ip;
        report.mark_page = this.app.randomString();
        report.mark_user = query.markUser;
        report.mark_uv = query.markUv;
        report.url = ctx.headers.referer;
        report.pre_url = query.preUrl;
        report.performance = query.performance;
        report.error_list = query.errorList;
        report.resource_list = query.resourceList;
        report.screenwidth = query.screenwidth;
        report.screenheight = query.screenheight;
        report.save();
        return {};
    }
}

module.exports = WebReportService;
