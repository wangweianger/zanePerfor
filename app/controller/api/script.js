'use strict';

const Controller = require('egg').Controller;

class ScriptController extends Controller {

    // web用户数据上报
    async getWebScript() {
        const { ctx } = this;
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Content-Type', 'application/javascript; charset=utf-8');

        const result = await ctx.service.web.webPerformanceScript.getPerformanceScript(ctx);
        ctx.body = result;
    }
}

module.exports = ScriptController;
