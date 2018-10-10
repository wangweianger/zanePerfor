'use strict';

const Service = require('egg').Service;

class PvuvivService extends Service {

    // 保存用户上报的数据
    async getPvUvIpData(type, appId, beginTime, endTime) {
        const querydata = { app_id: appId, create_time: { $gte: new Date(beginTime), $lt: new Date(endTime) } };
        const datas = await this.ctx.model.Web.WebPvuvip.find(querydata);
        return datas;
    }
}

module.exports = PvuvivService;
