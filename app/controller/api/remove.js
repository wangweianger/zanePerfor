'use strict';

const Controller = require('egg').Controller;

class RemoveController extends Controller {

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
        const appId = query.appId;

        if (!appId) throw new Error('获得error分类列表：appId不能为空');

        const result = await ctx.service.remove.deleteDb2WebData(appId, number, query.type);
        ctx.body = this.app.result({
            data: result,
        });
    }

}

module.exports = RemoveController;
