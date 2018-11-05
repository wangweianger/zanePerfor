'use strict';
const Controller = require('egg').Controller;

class AnalysisController extends Controller {

    // 用户漏斗分析列表
    async getAnalysislist() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const beginTime = query.beginTime;
        const endTime = query.endTime;
        const pageNo = query.pageNo;
        const ip = query.ip;
        const pageSize = query.pageSize || this.app.config.pageSize;

        if (!appId) throw new Error('用户漏斗分析列表：appId不能为空');

        const result = await ctx.service.web.analysis.getAnalysislist(appId, beginTime, endTime, ip, pageNo, pageSize);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 单个用户行为轨迹列表
    async getAnalysisOneList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const markuser = query.markuser;

        if (!appId) throw new Error('单个用户行为轨迹列表：appId不能为空');
        if (!markuser) throw new Error('单个用户行为轨迹列表：markuser不能为空');

        const result = await ctx.service.web.analysis.getAnalysisOneList(appId, markuser);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // top datas
    async getTopDatas() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const beginTime = query.beginTime;
        const endTime = query.endTime;
        const type = query.type || 1;
        if (!appId) throw new Error('top页面：appId不能为空');

        const result = await ctx.service.web.analysis.getTopDatas(appId, beginTime, endTime, type);
        ctx.body = this.app.result({
            data: result,
        });
    }

    // top datas
    async getProvinceAvgCount() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const beginTime = query.beginTime;
        const endTime = query.endTime;
        const type = query.type || 1;
        if (!appId) throw new Error('top页面：appId不能为空');

        const result = await ctx.service.web.analysis.getProvinceAvgCount(appId, beginTime, endTime, type);
        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = AnalysisController;
