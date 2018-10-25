'use strict';

const Controller = require('egg').Controller;

class AjaxsController extends Controller {

    // 清空db1 1日之前无用数据
    async deleteDb1WebData() {
        const { ctx } = this;
        const query = ctx.request.body;

        const result = await ctx.service.remove.deleteDb1WebData(query.type);
        ctx.body = this.app.result({
            data: result,
        });
    }

    // 清空db2 number日之前所有性能数据
    async deleteDb2WebData() {
        const { ctx } = this;
        const query = ctx.request.body;
        const number = query.number || 10;

        const result = await ctx.service.remove.deleteDb2WebData(number, query.type);
        ctx.body = this.app.result({
            data: result,
        });
    }

}

module.exports = AjaxsController;
