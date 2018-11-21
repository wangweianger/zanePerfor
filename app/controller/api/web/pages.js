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

    // 单个页面性能数据列表
    async getOnePageList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const url = query.url;
        if (!appId) throw new Error('单个页面性能列表：appId不能为空');
        if (!url) throw new Error('单个页面性能列表：url不能为空');

        const result = await ctx.service.web.webPages.getOnePageList(ctx);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 单个页面列表（简单版本）
    async getPagesForType() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const url = query.url;
        const speedType = query.type || 1;
        const pageNo = query.pageNo;
        const pageSize = query.pageSize;

        if (!appId) throw new Error('单个页面性能列表：appId不能为空');
        if (!url) throw new Error('单个页面性能列表：url不能为空');

        const result = await ctx.service.web.webPages.getPagesForType(appId, url, speedType, pageNo, pageSize);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 单个页面详情
    async getPageDetails() {
        const { ctx } = this;
        const query = ctx.request.query;
        const id = query.id;
        const appId = query.appId;

        if (!id) throw new Error('单个页面详情：id不能为空');
        if (!appId) throw new Error('单个页面详情：appId不能为空');

        const result = await ctx.service.web.webPages.getPageDetails(appId, id);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = PagesController;
