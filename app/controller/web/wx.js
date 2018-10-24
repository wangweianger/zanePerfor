'use strict';

const Controller = require('egg').Controller;

class WebController extends Controller {

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

}

module.exports = WebController;
