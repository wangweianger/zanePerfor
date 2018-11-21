'use strict';

const Controller = require('egg').Controller;

class PagesController extends Controller {

    // 平均页面性能列表
    async getAveragePageList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;

        if (!appId) throw new Error('平均页面性能列表：appId不能为空');

        const result = await ctx.service.wx.pages.getAveragePageList(ctx);

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

        const result = await ctx.service.wx.pages.getOnePageList(appId, ctx);

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

        const result = await ctx.service.wx.pages.getPagesForType(appId, url, speedType, pageNo, pageSize);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 单个页面详情
    async getPageDetails() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const id = query.id;

        if (!appId) throw new Error('单个页面详情：appId不能为空');
        if (!id) throw new Error('单个页面详情：id不能为空');

        const result = await ctx.service.wx.pages.getPageDetails(appId, id, 1);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 获得用户系统、地址位置、浏览器分类
    async getDataGroupBy() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const beginTime = query.beginTime;
        const endTime = query.endTime;
        const type = query.type || 1;
        const url = query.url;

        if (!appId) throw new Error('页面性能列表：appId不能为空');
        if (!url) throw new Error('页面性能列表：url不能为空');

        const result = await ctx.service.wx.pages.getDataGroupBy(type, url, appId, beginTime, endTime);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 单个页面详情（markpage）
    async getPageForMarkpage() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const markPage = query.markPage;

        if (!appId) throw new Error('单个页面详情：appId不能为空');
        if (!markPage) throw new Error('单个页面详情：markPage不能为空');

        const result = await ctx.service.wx.pages.getPageDetails(appId, markPage, 2);

        ctx.body = this.app.result({
            data: result,
        });
    }

}

module.exports = PagesController;
