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

}

module.exports = WebController;
