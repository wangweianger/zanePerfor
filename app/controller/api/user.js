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
        const { ctx } = this;
        const query = ctx.request.query;
        const token = query.token;
        if (!token) throw new Error('退出登录：token不能为空');

        await ctx.service.user.logout(token);
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

    // github callback
    async githubLogin() {
        const { ctx } = this;
        const query_code = ctx.query.code;
        try {
            const tokenResult = await ctx.curl('https://github.com/login/oauth/access_token', {
                method: 'POST',
                contentType: 'json',
                data: {
                    client_id: this.app.config.github.client_id,
                    client_secret: this.app.config.github.client_secret,
                    code: query_code,
                },
                dataType: 'json',
                timeout: 8000,
            });
            if (tokenResult.error) {
                await ctx.render('github', {
                    data: {
                        title: 'github login',
                        data: JSON.stringify({ desc: tokenResult.error_description }),
                    },
                });
                return;
            }

            const userResult = await ctx.curl(`https://api.github.com/user?access_token=${tokenResult.data.access_token}`, {
                dataType: 'json',
                timeout: 8000,
            });
            if (userResult.error) {
                await ctx.render('github', {
                    data: {
                        title: 'github login',
                        data: JSON.stringify({ desc: userResult.error_description }),
                    },
                });
                return;
            }

            const result = await ctx.service.user.githubRegister(userResult.data);
            await ctx.render('github', {
                data: {
                    title: 'github login',
                    data: JSON.stringify(result),
                },
            });
        } catch (err) {
            let result = { desc: 'github 权限验证失败, 请重试！' };
            if (err.toString().indexOf('timeout') > -1) {
                result = { desc: 'github 接口请求超时,请重试！' };
            }
            await ctx.render('github', {
                data: {
                    title: 'github login',
                    data: JSON.stringify(result),
                },
            });
        }
    }
}

module.exports = AjaxsController;
