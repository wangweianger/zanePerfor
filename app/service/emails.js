'use strict';

const Service = require('egg').Service;

class EmailsService extends Service {

    // 保存用户上报的数据
    async getList() {
        return await this.ctx.model.Email.find({}).exec() || {};
    }

    async addEmail(email, name) {
        const emails = this.ctx.model.Email();
        emails.email = email;
        emails.name = name;

        return await emails.save();
    }

    async deleteEmail(id) {
        return await this.ctx.model.Email.findOneAndRemove({ _id: id }).exec();
    }
}

module.exports = EmailsService;
