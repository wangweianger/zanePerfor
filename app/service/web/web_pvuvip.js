/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class PvuvivService extends Service {

    // 保存用户上报的数据
    async getPvUvIpData(appId, beginTime, endTime) {
        const querydata = { app_id: appId, type: 1, create_time: { $gte: new Date(beginTime), $lt: new Date(endTime) } };
        return await this.ctx.model.Web.WebPvuvip.find(querydata).read('sp').exec();
    }
    // 历史概况
    async getHistoryPvUvIplist(appId) {
        const query = { app_id: appId, type: 2 };
        return await this.ctx.model.Web.WebPvuvip.find(query)
            .read('sp')
            .sort({ create_time: -1 })
            .limit(5)
            .exec();
    }
    // 查询某日概况
    async getPvUvIpSurveyOne(appId, beginTime, endTime) {
        const query = { app_id: appId, type: 2, create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } };
        const data = await this.ctx.model.Web.WebPvuvip.findOne(query).read('sp').exec();
        if (data) return data;
        // 不存在则储存
        const pvuvipdata = await this.getPvUvIpSurvey(appId, beginTime, endTime, true);
        const result = await this.savePvUvIpData(appId, beginTime, 2, pvuvipdata);
        return result;
    }
    // 概况统计
    async getPvUvIpSurvey(appId, beginTime, endTime, type) {
        const querydata = { app_id: appId, create_time: { $gte: new Date(beginTime), $lt: new Date(endTime) } };
        const pv = Promise.resolve(this.ctx.model.Web.WebEnvironment.count(querydata).read('sp').exec());
        const uv = Promise.resolve(this.ctx.model.Web.WebEnvironment.distinct('mark_uv', querydata).read('sp').exec());
        const ip = Promise.resolve(this.ctx.model.Web.WebEnvironment.distinct('ip', querydata).read('sp').exec());
        if (!type) {
            const data1 = await Promise.all([ pv, uv, ip ]);
            return {
                pv: data1[0],
                uv: data1[1].length,
                ip: data1[2].length,
            };
        } else {
            const user = Promise.resolve(this.ctx.model.Web.WebEnvironment.distinct('mark_user', querydata).read('sp').exec());
            const bounce = Promise.resolve(this.bounceRate(querydata));
            const data2 = await Promise.all([ pv, uv, ip, user, bounce ]);
            return {
                pv: data2[0] || 0,
                uv: data2[1].length || 0,
                ip: data2[2].length || 0,
                user: data2[3].length || 0,
                bounce: data2[4] || 0,
            };
        }
    }
    // 跳出率
    async bounceRate(querydata) {
        const option = {
            map: function () { emit(this.mark_user, 1); },
            reduce: function (key, values) { return values.length == 1 },
            query: querydata,
            keeptemp: false,
            out: { replace: 'webjumpout' },
        }
        const res = await this.ctx.model.Web.WebEnvironment.mapReduce(option)
        const result = await res.model.find().where('value').equals(1).count().exec();
        return result;
    }
    // 保存pvuvip数据
    async savePvUvIpData(appId, endTime, type, pvuvipdata) {
        console.log(pvuvipdata.bounce / pvuvipdata.pv * 100)

        const pvuvip = this.ctx.model.Web.WebPvuvip();
        pvuvip.app_id = appId;
        pvuvip.pv = pvuvipdata.pv || 0;
        pvuvip.uv = pvuvipdata.uv || 0;
        pvuvip.ip = pvuvipdata.ip || 0;
        pvuvip.bounce = pvuvipdata.bounce ? (pvuvipdata.bounce / pvuvipdata.pv * 100).toFixed(2)+'%' : 0;
        pvuvip.depth = pvuvipdata.pv && pvuvipdata.user ? parseInt(pvuvipdata.pv / pvuvipdata.user) : 0;
        pvuvip.create_time = endTime;
        pvuvip.type = type;
        return await pvuvip.save();
    }
}

module.exports = PvuvivService;
