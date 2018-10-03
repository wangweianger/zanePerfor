'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
    async index() {
        const { ctx } = this;
        const list = await ctx.service.pvuvip.getWebPvUvIpByTime('2018-09-26');

        await ctx.render('home', {
            data: list,
        });
    }
}

module.exports = HomeController;
