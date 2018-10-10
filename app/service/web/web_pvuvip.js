'use strict';

const Service = require('egg').Service;

class PvuvivService extends Service {

    // 保存用户上报的数据
    async getPvUvIpData(appId, beginTime, endTime) {
        const querydata = { app_id: appId, create_time: { $gte: new Date(beginTime), $lt: new Date(endTime) } };
        const datas = await this.ctx.model.Web.WebPvuvip.find(querydata);
        return datas;
    }
    // 概况统计
    async getPvUvIpSurvey(appId, beginTime, endTime) {
        const querydata = { app_id: appId, create_time: { $gte: new Date(beginTime), $lt: new Date(endTime) } };
        const datas = await this.ctx.model.Web.WebEnvironment.find(querydata) || [];
        const length = datas.length;
        const uvSet = new Set();
        const ipSet = new Set();
        datas.forEach(item => {
            if (item.mark_user) uvSet.add(item.mark_user);
            if (item.ip) ipSet.add(item.ip);
        });
        return {
            pv: length,
            uv: uvSet.size,
            ip: ipSet.size,
        };
    }
}

module.exports = PvuvivService;
