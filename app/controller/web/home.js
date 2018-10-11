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

    // 浏览器端首页
    async webhome() {
        const { ctx } = this;
        await ctx.render('web/home', {
            data: {
                title: '网页PV,UV,IP统计',
            },
        });
    }

    // 访问页面性能数据
    async webpages() {
        const { ctx } = this;
        await ctx.render('web/pages', {
            data: {
                title: '页面性能数据',
            },
        });
    }
}

module.exports = HomeController;
