'use strict';

const Controller = require('egg').Controller;

class ErrorsController extends Controller {

    // 获得系统重启信息
    async getSysDbErrorList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const pageNo = query.pageNo;
        const pageSize = query.pageSize || this.app.config.pageSize;

        const result = await ctx.service.errors.getErrorList(pageNo, pageSize);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = ErrorsController;
