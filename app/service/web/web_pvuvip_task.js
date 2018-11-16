'use strict';
const parser = require('cron-parser');
const Service = require('egg').Service;
class WebReportService extends Service {

    // 获得web端 pvuvip
    async getWebPvUvIpByDay() {
        const interval = parser.parseExpression(this.app.config.pvuvip_task_day_time);
        const endTime = new Date(interval.prev().toString());
        const beginTime = new Date(interval.prev().toString());
        const query = { create_time: { $gte: beginTime, $lt: endTime } };

        const datas = await this.ctx.model.Web.WebEnvironment.distinct('app_id', query).read('sp').exec();
        this.groupData(datas, 2, query, beginTime, endTime);
    }
    // 定时执行每分钟的数据
    async getWebPvUvIpByMinute() {
        const interval = parser.parseExpression(this.app.config.pvuvip_task_minute_time);
        interval.prev();
        const endTime = new Date(interval.prev().toString());
        const beginTime = new Date(endTime.getTime() - 60000);
        const query = { create_time: { $gte: beginTime, $lt: endTime } };

        const datas = await this.ctx.model.Web.WebEnvironment.distinct('app_id', query).read('sp').exec();
        this.groupData(datas, 1, query, endTime);
    }
    // 对数据进行分组
    groupData(datas, type, query, beginTime, endTime) {
        if (!datas && !datas.length) return;
        datas.forEach(item => {
            // pvuvip
            this.savePvUvIpData(item, beginTime, type, query);
            console.log('----------------------------');
            // top排行
            this.ctx.service.web.analysis.saveRealTimeTopTask(item, type, beginTime, endTime);
        });
    }

    // 获得pvuvip数据
    async savePvUvIpData(appId, endTime, type, query) {
        query.app_id = appId;

        const pvpro = Promise.resolve(this.ctx.model.Web.WebEnvironment.count(query).read('sp').exec());
        const uvpro = Promise.resolve(this.ctx.model.Web.WebEnvironment.distinct('mark_uv', query).read('sp').exec());
        const ippro = Promise.resolve(this.ctx.model.Web.WebEnvironment.distinct('ip', query).read('sp').exec());
        let data = [];
        if (type === 1) {
            data = await Promise.all([ pvpro, uvpro, ippro ]);
        } else if (type === 2) {
            const user = Promise.resolve(this.ctx.model.Web.WebEnvironment.distinct('mark_user', query).read('sp').exec());
            const bounce = Promise.resolve(this.ctx.service.web.webPvuvip.bounceRate(query));
            data = await Promise.all([ pvpro, uvpro, ippro, user, bounce ]);
        }
        const pv = data[0] || 0;
        const uv = data[1].length || 0;
        const ip = data[2].length || 0;
        const user = type === 2 ? data[3].length : 0;
        const bounce = type === 2 ? data[4] : 0;

        const pvuvip = this.ctx.model.Web.WebPvuvip();
        pvuvip.app_id = appId;
        pvuvip.pv = pv;
        pvuvip.uv = uv;
        pvuvip.ip = ip;
        if (type === 2) pvuvip.bounce = bounce ? (bounce / pv * 100).toFixed(2) + '%' : 0;
        if (type === 2) pvuvip.depth = pv && user ? parseInt(pv / user) : 0;
        pvuvip.create_time = endTime;
        pvuvip.type = type;
        await pvuvip.save();
    }

}

module.exports = WebReportService;
