'use strict';

const Controller = require('egg').Controller;

class EmailsController extends Controller {

    async getList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const pageNo = query.pageNo;
        const pageSize = query.pageSize || this.app.config.pageSize;
        const email = query.email;

        const result = await ctx.service.emails.getList(pageNo, pageSize, email);

        ctx.body = this.app.result({
            data: result,
        });
    }

    async addEmail() {
        const { ctx } = this;
        const query = ctx.request.body;
        const email = query.email;
        const name = query.name;
        if (!email) throw new Error('新增邮件：邮件地址不能为空!');
        if (!name) throw new Error('新增邮件：邮件所属人不能为空!');

        const result = await ctx.service.emails.addEmail(email, name);

        ctx.body = this.app.result({
            data: result,
        });
    }

    async deleteEmail() {
        const { ctx } = this;
        const query = ctx.request.body;
        const id = query.id;
        const systemIds = query.systemIds || [];
        const email = query.email;

        if (!id) throw new Error('删除邮件：id不能为空!');

        const result = await ctx.service.emails.deleteEmail(id, systemIds, email);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = EmailsController;
