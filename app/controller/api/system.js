'use strict';

const Controller = require('egg').Controller;

class SystemController extends Controller {

    // 新增系统
    async addNewSystem() {
        const { ctx } = this;
        return await ctx.service.system.saveSystemData(ctx);
    }

    // 修改系统信息
    async updateSystem() {
        const { ctx } = this;
        return await ctx.service.system.updateSystemData(ctx);
    }

    // 根据用户id获取系统列表
    async getSysForUserId() {
        const { ctx } = this;
        const result = await ctx.service.system.getSysForUserId(ctx);
        ctx.body = this.app.result({
            data: result,
        });
    }

    // 根据系统ID获得单个系统信息
    async getSystemForId() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;

        const result = await ctx.service.system.getSystemForDb(appId);
        ctx.body = this.app.result({
            data: result,
        });
    }

    // 系统列表
    async getWebSystemList() {
        const { ctx } = this;

        const result = await ctx.service.system.getWebSystemList();
        ctx.body = this.app.result({
            data: result,
        });
    }

    // 删除系统中某个用户
    async deleteWebSystemUser() {
        const { ctx } = this;
        const query = ctx.request.body;
        const appId = query.appId;
        const userToken = query.userToken;

        if (!appId) throw new Error('删除系统中某个用户：appId不能为空');
        if (!userToken) throw new Error('删除系统中某个用户：userToken不能为空');

        const result = await ctx.service.system.deleteWebSystemUser(appId, userToken);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 系统中新增某个用户
    async addWebSystemUser() {
        const { ctx } = this;
        const query = ctx.request.body;
        const appId = query.appId;
        const userToken = query.userToken;

        if (!appId) throw new Error('系统中新增某个用户：appId不能为空');
        if (!userToken) throw new Error('系统中新增某个用户：userToken不能为空');

        const result = await ctx.service.system.addWebSystemUser(appId, userToken);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 删除某个系统
    async deleteSystem() {
        const { ctx } = this;
        const query = ctx.request.body;
        const appId = query.appId;

        if (!appId) throw new Error('删除某个系统：appId不能为空');

        const result = await ctx.service.system.deleteSystem(appId);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 新增 | 删除 日报邮件
    async handleDaliyEmail() {
        const { ctx } = this;
        const query = ctx.request.body;
        const appId = query.appId;
        const email = query.email;
        const type = query.type || 1;
        const item = query.item || 1;

        if (!appId) throw new Error('appId不能为空');

        const result = await ctx.service.system.handleDaliyEmail(appId, email, type, true, item);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = SystemController;
