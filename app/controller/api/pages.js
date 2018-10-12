'use strict';

const Controller = require('egg').Controller;

class PagesController extends Controller {

    // 平均页面性能列表
    async getAveragePageList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;

        if (!appId) throw new Error('平均页面性能列表：appId不能为空');

        const result = await ctx.service.web.webPages.getAveragePageList(ctx);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = PagesController;
