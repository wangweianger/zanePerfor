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
        const systemMags = {};
        const list = all[1] || [];

        // 获得邮件系统信息
        if (list && list.length) {
            for (let i = 0, len = list.length; i < len; i++) {
                if (list[i].system_ids && list[i].system_ids.length) {
                    const item = list[i].system_ids;
                    for (let o = 0, len = item.length; o < len; o++) {
                        const citem = item[o];
                        if (!systemMags[citem.system_id]) {
                            const result = await this.ctx.service.system.getSystemForAppId(citem.system_id);
                            systemMags[citem.system_id] = result;
                            citem.system_name = result.system_name;
                        }
                    }
                }
            }
        }

        console.log(systemMags);

        return {
            datalist: list,
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

    async deleteEmail(id, systemIds, email) {
        const result = await this.ctx.model.Email.findOneAndRemove({ _id: id }).exec();
        if (systemIds && systemIds.length) {
            systemIds.forEach(item => {
                if (item.system_id && item.type === 'daliy') {
                    this.ctx.service.system.handleDaliyEmail(item.system_id, email, 2, false);
                }
            });
        }
        return result;
    }

    // 更新 system_ids字段
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
            { $push: { system_ids: { $each: [{ system_id: appId, desc: '每日发送日报权限', type: 'daliy' }] } } } :
            { $pull: { system_ids: { system_id: appId, type: 'daliy' } } };

        const result = await this.ctx.model.Email.update(
            { email: emails },
            handleData,
            { multi: true }).exec();
        return result;
    }
}

module.exports = EmailsService;
