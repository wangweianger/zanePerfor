'use strict';

const Controller = require('egg').Controller;

class PagesController extends Controller {

    // 平均页面性能列表
    async getAveragePageList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const type = query.type || 1;
        const pageNo = query.pageNo ||1 ;
        const pageSize = query.pageSize || this.app.config.pageSize;
        const beginTime = query.beginTime;
        const endTime = query.endTime;

        if (!appId) throw new Error('平均页面性能列表：appId不能为空');

        const result = await ctx.service.web.webPages.getAveragePageList(appId, type, pageNo, pageSize, beginTime, endTime);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = PagesController;
