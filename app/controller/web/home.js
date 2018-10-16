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
}

module.exports = HomeController;
