'use strict';

const Controller = require('egg').Controller;

class ErrorController extends Controller {

    // 获得error分类列表
    async getAverageErrorList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;

        if (!appId) throw new Error('获得error分类列表：appId不能为空');

        const result = await ctx.service.wx.errors.getAverageErrorList(ctx);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 获得单个ERROR资源列表信息
    async getOneErrorList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const url = query.url;
        const category = query.category || 'resource';
        const pageNo = query.pageNo || 1;
        const pageSize = query.pageSize || this.app.config.pageSize;
        const beginTime = query.beginTime;
        const endTime = query.endTime;

        if (!appId) throw new Error('获得单个ERROR资源列表信息：appId不能为空');
        if (!url) throw new Error('获得单个ERROR资源列表信息：url地址不能为空');

        const result = await ctx.service.wx.errors.getOneErrorList(appId, url, category, pageNo, pageSize, beginTime, endTime);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 获得单个api的性能列表数据
    async getOneResourceList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const url = query.url;
        const pageNo = query.pageNo || 1;
        const pageSize = query.pageSize || this.app.config.pageSize;

        if (!appId) throw new Error('单个Resource性能列表数据：appId不能为空');
        if (!url) throw new Error('单个Resource性能列表数据：api地址不能为空');


        const result = await ctx.service.web.webResource.getOneResourceList(appId, url, pageNo, pageSize);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 单个error详情信息
    async getErrorDetail() {
        const { ctx } = this;
        const query = ctx.request.query;
        const id = query.id;
        const appId = query.appId;

        if (!id) throw new Error('单个error详情信息：id不能为空');
        if (!appId) throw new Error('单个error详情信息：appId不能为空');

        const result = await ctx.service.wx.errors.getErrorDetail(appId, id);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = ErrorController;
