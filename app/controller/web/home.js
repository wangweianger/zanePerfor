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
    async webpagesavg() {
        const { ctx } = this;
        await ctx.render('web/pagesavg', {
            data: {
                title: '页面平均性能指标',
            },
        });
    }

    // 单页面访问页面列表性能
    async webpageslist() {
        const { ctx } = this;
        await ctx.render('web/pageslist', {
            data: {
                title: '页面性能数据列表',
            },
        });
    }
}

module.exports = HomeController;
