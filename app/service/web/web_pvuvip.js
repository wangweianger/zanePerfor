'use strict';

const Service = require('egg').Service;

class PvuvivService extends Service {

    // 保存用户上报的数据
    async getPvUvIpData(appId, beginTime, endTime) {
        const querydata = { app_id: appId, type: 1, create_time: { $gte: new Date(beginTime), $lt: new Date(endTime) } };
        const datas = await this.ctx.model.Web.WebPvuvip.find(querydata);
        return datas;
    }
    // 概况统计
    async getPvUvIpSurvey(appId, beginTime, endTime) {
        const querydata = { app_id: appId, create_time: { $gte: new Date(beginTime), $lt: new Date(endTime) } };
        const pv = Promise.resolve(this.ctx.model.Web.WebEnvironment.count(querydata));
        const uv = Promise.resolve(this.ctx.model.Web.WebEnvironment.distinct('mark_user', querydata));
        const ip = Promise.resolve(this.ctx.model.Web.WebEnvironment.distinct('ip', querydata));
        const data = await Promise.all([ pv, uv, ip ]);
        return {
            pv: data[0],
            uv: data[1].length,
            ip: data[2].length,
        };
    }
}

module.exports = PvuvivService;
