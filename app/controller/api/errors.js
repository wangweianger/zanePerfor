'use strict';

const Controller = require('egg').Controller;

class ErrorsController extends Controller {

    // 获得系统重启信息
    async getSysDbErrorList() {
        const { ctx } = this;
        const result = await ctx.service.errors.getErrorList();

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = ErrorsController;
