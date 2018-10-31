'use strict';

const Service = require('egg').Service;

class PvuvivService extends Service {

    // 保存用户上报的数据
    async getPvUvIpData(appId, beginTime, endTime) {
        const querydata = { app_id: appId, type: 1, create_time: { $gte: new Date(beginTime), $lt: new Date(endTime) } };
        const datas = await this.ctx.model.Wx.WxPvuvip.find(querydata).exec();
        return datas;
    }
    // 概况统计
    async getPvUvIpSurvey(appId, beginTime, endTime) {
        const querydata = { app_id: appId, create_time: { $gte: new Date(beginTime), $lt: new Date(endTime) } };
        const pv = Promise.resolve(this.ctx.model.Wx.WxPages.count(querydata).exec());
        const uv = Promise.resolve(this.ctx.model.Wx.WxPages.distinct('mark_user', querydata).exec());
        const ip = Promise.resolve(this.ctx.model.Wx.WxPages.distinct('ip', querydata).exec());
        const data = await Promise.all([ pv, uv, ip ]);
        return {
            pv: data[0],
            uv: data[1].length,
            ip: data[2].length,
        };
    }
    // 查询某日概况
    async getPvUvIpSurveyOne(appId, beginTime, endTime) {
        const query = { app_id: appId, type: 2, create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } };
        const data = await this.ctx.model.Wx.WxPvuvip.findOne(query);
        if (data) return data;
        // 不存在则储存
        const pvuvipdata = await this.getPvUvIpSurvey(appId, beginTime, endTime);
        const result = await this.savePvUvIpData(appId, endTime, 2, pvuvipdata);
        return result;
    }
    // 历史概况
    async getHistoryPvUvIplist(appId) {
        const query = { app_id: appId, type: 2 };
        return await this.ctx.model.Wx.WxPvuvip.find(query)
            .sort({ create_time: -1 })
            .limit(5)
            .exec();
    }
    // 保存pvuvip数据
    async savePvUvIpData(appId, endTime, type, pvuvipdata) {
        const pvuvip = this.ctx.model.Wx.WxPvuvip();
        pvuvip.app_id = appId;
        pvuvip.pv = pvuvipdata.pv || 0;
        pvuvip.uv = pvuvipdata.uv || 0;
        pvuvip.ip = pvuvipdata.ip || 0;
        pvuvip.create_time = endTime;
        pvuvip.type = type;

        return await pvuvip.save();
    }
}

module.exports = PvuvivService;
