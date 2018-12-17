'use strict';

const Controller = require('egg').Controller;

class SystemController extends Controller {

    async getList() {
        const { ctx } = this;
        const result = await ctx.service.emails.getList();

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
        if (!id) throw new Error('删除邮件：id不能为空!');

        const result = await ctx.service.emails.deleteEmail(id);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = SystemController;
