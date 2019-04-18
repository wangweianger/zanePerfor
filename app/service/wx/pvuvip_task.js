'use strict';
const parser = require('cron-parser');
const Service = require('egg').Service;
class PvuvipTaskService extends Service {

    // 获得web端 pvuvip
    async getWxPvUvIpByDay() {
        const interval = parser.parseExpression(this.app.config.pvuvip_task_day_time);
        const endTime = new Date(interval.prev().toString());
        const beginTime = new Date(interval.prev().toString());
        const query = { create_time: { $gte: beginTime, $lt: endTime } };

        const datas = await this.ctx.model.System.distinct('app_id', { type: 'wx' }).read('sp').exec();
        this.groupData(datas, 2, query, beginTime, endTime);
    }
    // 定时执行每分钟的数据
    async getWxPvUvIpByMinute() {
        const interval = parser.parseExpression(this.app.config.pvuvip_task_minute_time);
        const endTime = new Date(interval.prev().toString());
        const beginTime = new Date(interval.prev().toString());
        const query = { create_time: { $gte: beginTime, $lt: endTime } };

        const datas = await this.ctx.model.System.distinct('app_id', { type: 'wx' }).read('sp').exec();
        this.groupData(datas, 1, query, endTime);
    }
    // 对数据进行分组
    groupData(datas, type, query, beginTime, endTime) {
        if (!datas && !datas.length) return;
        datas.forEach(item => {
            // pvuvip
            this.savePvUvIpData(item, beginTime, type, query);
            // top排行
            this.ctx.service.wx.analysis.saveRealTimeTopTask(item, type, beginTime, endTime);
        });
    }

    // 获得pvuvip数据
    async savePvUvIpData(appId, endTime, type, query) {
        try {
            const pvpro = Promise.resolve(this.ctx.service.wx.pvuvip.pv(appId, query));
            const uvpro = Promise.resolve(this.ctx.service.wx.pvuvip.uv(appId, query));
            const ippro = Promise.resolve(this.ctx.service.wx.pvuvip.ip(appId, query));
            const ajpro = Promise.resolve(this.ctx.service.wx.pvuvip.ajax(appId, query));
            const flpro = Promise.resolve(this.ctx.service.wx.pvuvip.flow(appId, query));

            let data = [];
            if (type === 1) {
                data = await Promise.all([ pvpro, uvpro, ippro, ajpro, flpro ]);
            } else if (type === 2) {
                const user = Promise.resolve(this.ctx.service.wx.pvuvip.user(appId, query));
                const bounce = Promise.resolve(this.ctx.service.wx.pvuvip.bounce(appId, query));
                data = await Promise.all([ pvpro, uvpro, ippro, ajpro, flpro, user, bounce ]);
            }

            const pv = data[0] || 0;
            const uv = data[1].length ? data[1][0].count : 0;
            const ip = data[2].length ? data[2][0].count : 0;
            const ajax = data[3] || 0;
            const flow = data[4].length ? data[4][0].amount : 0;
            const user = type === 2 ? (data[5].length ? data[5][0].count : 0) : 0;
            const bounce = type === 2 ? data[6] : 0;

            const pvuvip = this.ctx.model.Wx.WxPvuvip();
            pvuvip.app_id = appId;
            pvuvip.pv = pv;
            pvuvip.uv = uv;
            pvuvip.ip = ip;
            pvuvip.ajax = ajax;
            pvuvip.flow = flow;
            if (type === 2) pvuvip.bounce = bounce ? (bounce / pv * 100).toFixed(2) + '%' : 0;
            if (type === 2) pvuvip.depth = pv && user ? parseInt(pv / user) : 0;
            pvuvip.create_time = endTime;
            pvuvip.type = type;
            await pvuvip.save();

            // 每日邮件触达
            if (type === 2) {
                this.ctx.service.wx.sendEmail.getDaliyDatas({
                    appId,
                    pv,
                    uv,
                    ip,
                    ajax,
                    flow,
                    bounce: bounce ? (bounce / pv * 100).toFixed(2) + '%' : 0,
                    depth: pv && user ? parseInt(pv / user) : 0,
                }, 'pvuvip');
            }
            // 流量峰值 超过历史top邮件触达
            if (type === 1) {
                this.ctx.service.emails.highestPvTipsEmail({ appId, pv, uv, ip, ajax, flow });
            }
        } catch (err) { console.log(err); }
    }
}

module.exports = PvuvipTaskService;
