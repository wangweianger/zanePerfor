'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {

    // 系统应用列表
    async systemlist() {
        const { ctx } = this;
        await ctx.render('home', {
            data: {
                title: '应用列表',
            },
        });
    }

    // 新增系统选择应用类型
    async selectype() {
        const { ctx } = this;
        await ctx.render('selectype', {
            data: {
                title: '选择应用类型',
            },
        });
    }

    // 用户登录
    async login() {
        const { ctx } = this;
        await ctx.render('login', {
            data: {
                title: '登录系统',
                gh_client_id: this.app.config.github.client_id,
                gh_scope: this.app.config.github.scope,
                wb_client_id: this.app.config.weibo.client_id,
                wb_scope: this.app.config.weibo.scope,
                wx_client_id: this.app.config.wechat.client_id,
            },
        });
    }

    // 系统列表
    async systems() {
        const { ctx } = this;
        await ctx.render('systems', {
            data: {
                title: '系统列表',
            },
        });
    }

    // 用户管理
    async users() {
        const { ctx } = this;
        await ctx.render('users', {
            data: {
                title: '用户列表',
            },
        });
    }

    // 系统重启信息
    async errors() {
        const { ctx } = this;
        await ctx.render('errors', {
            data: {
                title: '系统重启信息',
            },
        });
    }

    // 系统重启信息
    async emails() {
        const { ctx } = this;
        await ctx.render('emails', {
            data: {
                title: '邮件管理',
            },
        });
    }

}

module.exports = HomeController;
