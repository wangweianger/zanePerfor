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

    async webpagedetails() {
        const { ctx } = this;
        await ctx.render('web/pagedetails', {
            data: {
                title: '页面性能详情数据',
            },
        });
    }

    // 慢页面列表
    async webslowpageslist() {
        const { ctx } = this;
        await ctx.render('web/slowpageslist', {
            data: {
                title: '页面性能数据列表',
            },
        });
    }

    // ajax请求平均性能数据
    async webajaxavg() {
        const { ctx } = this;
        await ctx.render('web/ajaxavg', {
            data: {
                title: 'ajax平均性能指标',
            },
        });
    }

    // ajax详情
    async webajaxdetailg() {
        const { ctx } = this;
        await ctx.render('web/ajaxdetail', {
            data: {
                title: 'ajax详情',
            },
        });
    }

    // 慢资源列表
    async webresourceavg() {
        const { ctx } = this;
        await ctx.render('web/resourceavg', {
            data: {
                title: '慢资源平均性能指标',
            },
        });
    }

    // 慢资源详情
    async webresourcedetail() {
        const { ctx } = this;
        await ctx.render('web/resourcedetail', {
            data: {
                title: '慢资源详情',
            },
        });
    }
}

module.exports = HomeController;
