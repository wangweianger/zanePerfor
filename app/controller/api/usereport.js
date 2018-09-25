'use strict';

const Controller = require('egg').Controller;

class UserReportController extends Controller {

    // 用户数据上报
    async userPort() {
        const { ctx } = this;
        const list = await ctx.service.userport.saveUseReportData(ctx);
        ctx.body = {
            code: 1000,
            data: list,
        };
    }
}

module.exports = UserReportController;
