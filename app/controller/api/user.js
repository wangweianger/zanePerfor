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
}

module.exports = AjaxsController;
