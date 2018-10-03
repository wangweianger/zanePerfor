'use strict';

const Service = require('egg').Service;

class WebReportService extends Service {

    // 获得web端 pvuvip
    async getWebPvUvIpByTime() {
        const endTime = new Date().getTime();
        const beginTime = endTime - 60000;

        const query = { create_time: { $gt: beginTime, $lt: endTime } };
        // const query = { create_time: { $lt: endTime } };
        const datas = await this.ctx.model.Web.WebEnvironment.find(query)
            .exec();
        this.groupData(datas, endTime);
    }
    // 对数据进行分组
    groupData(datas, endTime) {
        if (!datas && !datas.length) return;
        const obj = {};
        datas.forEach(item => {
            if (!obj[item.app_id]) {
                obj[item.app_id] = [ item ];
            } else {
                obj[item.app_id].push(item);
            }
        });
        // 遍历组
        for (const key in obj) {
            this.savePvUvIpData(obj[key], key, endTime);
        }
    }

    // 获得pvuvip数据
    async savePvUvIpData(data, appId, endTime) {
        const length = data.length;
        const uvSet = new Set();
        const ipSet = new Set();

        data.forEach(item => {
            if (item.mark_user) uvSet.add(item.mark_user);
            if (item.ip) ipSet.add(item.ip);
        });

        const pv = length;
        const uv = uvSet.size;
        const ip = ipSet.size;

        const pvuvip = this.ctx.model.Web.WebPvuvip();
        pvuvip.app_id = appId;
        pvuvip.pv = pv;
        pvuvip.uv = uv;
        pvuvip.ip = ip;
        pvuvip.create_time = endTime;
        pvuvip.uv_set = uvSet;
        pvuvip.ip_set = ipSet;
        await pvuvip.save();
    }

}

module.exports = WebReportService;
