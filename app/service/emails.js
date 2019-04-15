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
                        } else {
                            citem.system_name = systemMags[citem.system_id].system_name;
                        }
                    }
                }
            }
        }

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
                    this.ctx.service.system.handleDaliyEmail(item.system_id, email, 2, false, 1);
                } else if (item.system_id && item.type === 'highest') {
                    this.ctx.service.system.handleDaliyEmail(item.system_id, email, 2, false, 2);
                }
            });
        }
        return result;
    }

    // 更新 system_ids字段
    async updateSystemIds(opt) {
        let { email, appId, handletype, handleitem } = opt;
        handletype = handletype * 1;
        handleitem = handleitem * 1;

        let str = '';
        let type = '';
        if (handleitem === 1) {
            str = '每日发送日报权限';
            type = 'daliy';
        } else if (handleitem === 2) {
            str = '超过历史流量峰值邮件触达';
            type = 'highest';
        }
        const handleData = handletype === 1 ?
            { $push: { system_ids: { $each: [{ system_id: appId, desc: str, type }] } } } :
            { $pull: { system_ids: { system_id: appId, type } } };

        const result = await this.ctx.model.Email.update(
            { email },
            handleData,
            { multi: true }).exec();
        return result;
    }
}

module.exports = EmailsService;
