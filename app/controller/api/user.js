'use strict';

const Controller = require('egg').Controller;

class AjaxsController extends Controller {

    // 用户登录
    async login() {
        const { ctx } = this;
        const query = ctx.request.body;
        const userName = query.userName;
        const passWord = query.passWord;

        if (!userName) throw new Error('用户登录：userName不能为空');
        if (!passWord) throw new Error('用户登录：passWord不能为空');

        const result = await ctx.service.user.login(userName, passWord);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 用户注册
    async register() {
        const { ctx } = this;
        const query = ctx.request.body;
        const userName = query.userName;
        const passWord = query.passWord;

        if (!userName) throw new Error('用户登录：userName不能为空');
        if (!passWord) throw new Error('用户登录：passWord不能为空');

        const result = await ctx.service.user.register(userName, passWord);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 退出登录
    async logout() {
        this.ctx.cookies.set('usertoken', '');
        this.ctx.body = this.app.result({
            data: {},
        });
    }

    // 获得用户列表
    async getUserList() {
        const { ctx } = this;
        const query = ctx.request.body;
        const pageNo = query.pageNo;
        const pageSize = query.pageSize || this.app.config.pageSize;
        const userName = query.userName;

        const result = await ctx.service.user.getUserList(pageNo, pageSize, userName);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 冻结解冻用户
    async setIsUse() {
        const { ctx } = this;
        const query = ctx.request.body;
        const token = query.token;
        const isUse = query.isUse || 0;

        if (!token) throw new Error('冻结解冻用户：token不能为空');

        const result = await ctx.service.user.setIsUse(token, isUse);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 删除用户
    async delete() {
        const { ctx } = this;
        const query = ctx.request.body;
        const token = query.token;

        if (!token) throw new Error('删除用户：token不能为空');

        const result = await ctx.service.user.delete(token);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = AjaxsController;
