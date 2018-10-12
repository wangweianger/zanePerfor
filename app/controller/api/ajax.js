'use strict';

const Controller = require('egg').Controller;

class AjaxsController extends Controller {

    // 平均页面性能列表
    async getPageAjaxs() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const url = query.url;
        const pageNo = query.pageNo;
        const pageSize = query.pageSize;

        if (!appId) throw new Error('页面ajax信息：appId不能为空');
        if (!url) throw new Error('页面ajax信息：url不能为空');

        const result = await ctx.service.web.webAjaxs.getPageAjaxs(appId, url, pageNo, pageSize);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = AjaxsController;
