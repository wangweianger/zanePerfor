'use strict';

const Controller = require('egg').Controller;

class WxController extends Controller {

    // 新增系统
    async wxaddsystem() {
        const { ctx } = this;
        await ctx.render('wx/addsystem', {
            data: {
                title: '新增系统',
            },
        });
    }
    // 小程序首页
    async wxhome() {
        const { ctx } = this;
        await ctx.render('wx/home', {
            data: {
                title: '数据分析',
            },
        });
    }
    // 小程序设置页面
    async wxsetting() {
        const { ctx } = this;
        await ctx.render('wx/setting', {
            data: {
                title: '系统设置',
            },
        });
    }

    // 访问页面性能数据
    async wxpagesavg() {
        const { ctx } = this;
        await ctx.render('wx/pagesavg', {
            data: {
                title: '页面平均性能指标',
            },
        });
    }

    // 单页面访问页面列表性能
    async wxpageslist() {
        const { ctx } = this;
        await ctx.render('wx/pageslist', {
            data: {
                title: '页面性能数据列表',
            },
        });
    }

    async wxpagedetails() {
        const { ctx } = this;
        await ctx.render('wx/pagedetails', {
            data: {
                title: '页面性能详情数据',
            },
        });
    }

    // ajax请求平均性能数据
    async wxajaxavg() {
        const { ctx } = this;
        await ctx.render('wx/ajaxavg', {
            data: {
                title: 'ajax平均性能指标',
            },
        });
    }

    // ajax详情
    async wxajaxdetail() {
        const { ctx } = this;
        await ctx.render('wx/ajaxdetail', {
            data: {
                title: 'ajax详情',
            },
        });
    }

    async wxajaxitemdetail() {
        const { ctx } = this;
        await ctx.render('wx/ajaxitemdetail', {
            data: {
                title: '单个ajax详情信息',
            },
        });
    }

    // 错误分类列表
    async wxerroravg() {
        const { ctx } = this;
        await ctx.render('wx/erroravg', {
            data: {
                title: '错误分类列表',
            },
        });
    }

    // 错误详情列表
    async wxerrordetail() {
        const { ctx } = this;
        await ctx.render('wx/errordetail', {
            data: {
                title: '错误详情列表',
            },
        });
    }
    // 错误页面详情信息
    async wxerroritemdetail() {
        const { ctx } = this;
        await ctx.render('wx/erroritemdetail', {
            data: {
                title: '错误页面详情信息',
            },
        });
    }

    // 用户访问轨迹
    async analysislist() {
        const { ctx } = this;
        await ctx.render('wx/analysislist', {
            data: {
                title: '用户行为访问轨迹',
            },
        });
    }

    // 访问轨迹详情
    async analysisdetail() {
        const { ctx } = this;
        await ctx.render('wx/analysisdetail', {
            data: {
                title: '用户访问轨迹详情',
            },
        });
    }
    // TOP分析
    async wxtop() {
        const { ctx } = this;
        await ctx.render('wx/top', {
            data: {
                title: 'TOP指标',
            },
        });
    }

    async wxdiagram() {
        const { ctx } = this;
        await ctx.render('wx/diagram', {
            data: {
                title: '全国省份访问量热力图',
            },
        });
    }
}

module.exports = WxController;
