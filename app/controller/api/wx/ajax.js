'use strict';

const Controller = require('egg').Controller;

class AjaxsController extends Controller {

    // 平均页面性能列表
    async getPageAjaxsAvg() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const url = query.url;

        if (!appId) throw new Error('页面ajax信息：appId不能为空');
        if (!url) throw new Error('页面ajax信息：url不能为空');

        const result = await ctx.service.wx.ajaxs.getPageAjaxsAvg(appId, url);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 平均AJAX性能列表
    async getAverageAjaxList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;

        if (!appId) throw new Error('平均AJAX性能列表：appId不能为空');

        const result = await ctx.service.wx.ajaxs.getAverageAjaxList(ctx);

        ctx.body = this.app.result({
            data: result,
        });
    }
    // 获得单个api的平均性能数据
    async getOneAjaxAvg() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const url = query.url;
        const beginTime = query.beginTime;
        const endTime = query.endTime;
        const type = query.type;

        if (!appId) throw new Error('单个AJAX平均性能数据：appId不能为空');
        if (!url) throw new Error('单个AJAX平均性能数据：api地址不能为空');

        const result = await ctx.service.wx.ajaxs.getOneAjaxAvg(appId, url, beginTime, endTime, type);

        ctx.body = this.app.result({
            data: result,
        });
    }
    // 获得单个api的性能列表数据
    async getOneAjaxList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const url = query.url;
        const pageNo = query.pageNo || 1;
        const pageSize = query.pageSize || this.app.config.pageSize;
        const beginTime = query.beginTime;
        const endTime = query.endTime;
        const type = query.type;

        if (!appId) throw new Error('单个AJAX平均性能数据：appId不能为空');
        if (!url) throw new Error('单个AJAX平均性能数据：api地址不能为空');

        const result = await ctx.service.wx.ajaxs.getOneAjaxList(appId, url, pageNo, pageSize, beginTime, endTime, type);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 获得单个ajax详情信息
    async getOneAjaxDetail() {
        const { ctx } = this;
        const query = ctx.request.query;
        const id = query.id;
        const appId = query.appId;

        if (!id) throw new Error('获得单个ajax详情信息：id不能为空');
        if (!appId) throw new Error('获得单个ajax详情信息：appId不能为空');

        const result = await ctx.service.wx.ajaxs.getOneAjaxDetail(appId, id);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = AjaxsController;
