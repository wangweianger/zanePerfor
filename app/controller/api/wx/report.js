'use strict';

const Controller = require('egg').Controller;

class AjaxsController extends Controller {

    // 微信端用户数据上报
    async wxReport() {
        const { ctx } = this;
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Credentials', true);
        ctx.set('Content-Type', 'application/json;charset=UTF-8');
        const list = await ctx.service.wx.report.saveWxReportData(ctx);

        ctx.body = {
            code: 1000,
            data: list,
        };
    }

}

module.exports = AjaxsController;
