'use strict';

const Controller = require('egg').Controller;

class WebController extends Controller {

    // 新增系统
    async webaddsystem() {
        const { ctx } = this;
        await ctx.render('web/addsystem', {
            data: {
                title: '新增系统',
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
    async webajaxdetail() {
        const { ctx } = this;
        await ctx.render('web/ajaxdetail', {
            data: {
                title: 'ajax详情',
            },
        });
    }

    async webajaxitemdetail() {
        const { ctx } = this;
        await ctx.render('web/ajaxitemdetail', {
            data: {
                title: '单个ajax详情信息',
            },
        });
    }

    // 慢资源列表
    async webresourceavg() {
        const { ctx } = this;
        await ctx.render('web/resourcesavg', {
            data: {
                title: '慢资源平均性能指标',
            },
        });
    }

    // 慢资源详情
    async webresourcedetail() {
        const { ctx } = this;
        await ctx.render('web/resourcesdetail', {
            data: {
                title: '慢资源详情',
            },
        });
    }

    async webresourcesitemdetail() {
        const { ctx } = this;
        await ctx.render('web/resourcesitemdetail', {
            data: {
                title: '单个慢资源详情信息',
            },
        });
    }

    // 错误分类列表
    async weberroravg() {
        const { ctx } = this;
        await ctx.render('web/erroravg', {
            data: {
                title: '错误分类列表',
            },
        });
    }

    // 错误详情列表
    async weberrordetail() {
        const { ctx } = this;
        await ctx.render('web/errordetail', {
            data: {
                title: '错误详情列表',
            },
        });
    }
    // 错误页面详情信息
    async weberroritemdetail() {
        const { ctx } = this;
        await ctx.render('web/erroritemdetail', {
            data: {
                title: '错误页面详情信息',
            },
        });
    }
    // web设置界面
    async websetting() {
        const { ctx } = this;
        await ctx.render('web/setting', {
            data: {
                title: '系统设置',
            },
        });
    }

    // 用户访问轨迹
    async analysislist() {
        const { ctx } = this;
        await ctx.render('web/analysislist', {
            data: {
                title: '用户行为访问轨迹',
            },
        });
    }

    // 访问轨迹详情
    async analysisdetail() {
        const { ctx } = this;
        await ctx.render('web/analysisdetail', {
            data: {
                title: '用户访问轨迹详情',
            },
        });
    }
    // TOP分析
    async webtop() {
        const { ctx } = this;
        await ctx.render('web/top', {
            data: {
                title: 'TOP指标',
            },
        });
    }

    async webdiagram() {
        const { ctx } = this;
        await ctx.render('web/diagram', {
            data: {
                title: '全国省份访问量热力图',
            },
        });
    }

    async webalarm() {
        const { ctx } = this;
        await ctx.render('web/alarm', {
            data: {
                title: '应用告警设置',
            },
        });
    }

}

module.exports = WebController;

