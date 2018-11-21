'use strict';

const Service = require('egg').Service;

class WxReportService extends Service {

    // 保存用户上报的数据
    async saveWxReportData(ctx) {
        const query = ctx.request.body;
        const ip = ctx.get('X-Real-IP') || ctx.get('X-Forwarded-For') || ctx.ip;

        // 参数校验
        if (!query.appId) throw new Error('web端上报数据操作：app_id不能为空');

        const system = await this.service.system.getSystemForAppId(query.appId);
        if (!system) return {};
        if (system.is_use !== 0) return {};

        const report = ctx.model.Wx.WxReport();
        report.app_id = query.appId;
        report.create_time = query.time;
        report.errs = query.errs;
        report.ip = ip;
        report.mark_page = this.app.randomString();
        report.mark_user = query.markuser;
        report.mark_uv = query.markuv;
        report.net = query.net;
        report.system = query.system;
        report.loc = query.loc;
        report.userInfo = query.userInfo;
        report.pages = query.pages;
        report.ajaxs = query.ajaxs;
        report.save();
        return {};
    }
}
module.exports = WxReportService;
