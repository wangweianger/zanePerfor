'use strict';

const Service = require('egg').Service;

class EmailsService extends Service {

    // 保存用户上报的数据
    async getList(pageNos, pageSize, email) {
        pageNos = pageNos * 1;
        pageSize = pageSize * 1;

        const query = {};
        if (email) query.email = email;

        const count = Promise.resolve(this.ctx.model.Email.count(query).exec());
        const datas = Promise.resolve(
            this.ctx.model.Email.find(query).skip((pageNos - 1) * pageSize)
                .limit(pageSize)
                .exec()
        );
        const all = await Promise.all([ count, datas ]);

        return {
            datalist: all[1],
            totalNum: all[0],
            pageNo: pageNos,
        };
    }

    async addEmail(email, name) {
        const emails = this.ctx.model.Email();
        emails.email = email;
        emails.name = name;

        return await emails.save();
    }

    async deleteEmail(id) {
        const result = await this.ctx.model.Email.findOneAndRemove({ _id: id }).exec();
        return result;
    }

    async updateSystemIds(opt) {
        switch (opt.type) {
        case 'daliy':
            await this.updateDaliyList(opt.email, opt.appId, opt.handletype);
            break;
        default:
            break;
        }
    }

    // 更新日报字段
    async updateDaliyList(emails, appId, handletype) {
        handletype = handletype * 1;
        const handleData = handletype === 1 ?
            { $push: { system_ids: { $each: [{ systemId: appId, desc: '每日发送日报权限', type: 'daliy' }] } } } :
            { $pull: { system_ids: { $elemMatch: { systemId: appId, type: 'daliy' } } } };

        console.log(JSON.stringify(handleData));

        const result = await this.ctx.model.Email.update(
            { email: emails },
            handleData,
            { multi: true }).exec();
        return result;
    }
}

module.exports = EmailsService;
