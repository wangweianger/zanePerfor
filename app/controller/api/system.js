'use strict';

const Controller = require('egg').Controller;

class SystemController extends Controller {

    // 新增系统
    async addNewSystem() {
        const { ctx } = this;
        return await ctx.service.web.webSystem.saveSystemData(ctx);
    }

    // 修改系统信息
    async updateSystem() {
        const { ctx } = this;
        return await ctx.service.web.webSystem.updateSystemData(ctx);
    }

    // 根据用户id获取系统列表
    async getSysForUserId() {
        const { ctx } = this;
        await ctx.service.web.webSystem.getSysForUserId(ctx);
    }

    // 根据系统ID获得单个系统信息
    async getSystemForId() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;

        const result = await ctx.service.web.webSystem.getSystemForDb(appId);
        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = SystemController;
