'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
    // 系统应用列表
    async systemlist() {
        const { ctx } = this;
        await ctx.render('home', {
            data: {},
        });
    }

    // 浏览器端首页
    async webhome() {
        const { ctx } = this;
        await ctx.render('web/home', {
            data: {},
        });
    }
}

module.exports = HomeController;
