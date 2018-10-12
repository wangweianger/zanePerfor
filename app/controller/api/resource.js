'use strict';

const Controller = require('egg').Controller;

class ResourceController extends Controller {

    // 根据某个页面获得资源列表
    async getResourceForType() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const url = query.url;
        const speedType = query.type || 1;
        const pageNo = query.pageNo;
        const pageSize = query.pageSize;

        if (!appId) throw new Error('单个页面资源性能列表：appId不能为空');
        if (!url) throw new Error('单个页面资源性能列表：url不能为空');

        const result = await ctx.service.web.webResource.getResourceForType(appId, url, speedType, pageNo, pageSize);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = ResourceController;
