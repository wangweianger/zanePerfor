'use strict';

const Controller = require('egg').Controller;

class WebController extends Controller {

    // 新增系统
    async wxaddsystem() {
        const { ctx } = this;
        await ctx.render('web/addsystem', {
            data: {
                title: '新增系统',
            },
        });
    }

}

module.exports = WebController;
