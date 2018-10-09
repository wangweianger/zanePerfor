'use strict';

const Service = require('egg').Service;

class PvuvivService extends Service {

    // 保存用户上报的数据
    async getPvUvIpData(ctx) {
        const query = ctx.request.body;
        const type = query.type || 'm';
        const appId = query.appId;
        const beginTime = query.beginTime;
        const endTime = query.endTime;

        const querydata = { app_id: appId, create_time: { $gt: beginTime, $lt: endTime } };
        const datas = await this.ctx.model.Web.WebPvuvip.find(querydata);
        return datas;
    }
}

module.exports = PvuvivService;
