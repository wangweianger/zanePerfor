'use strict';
const parser = require('cron-parser');
const Service = require('egg').Service;
class WebReportService extends Service {

    // 获得web端 pvuvip
    async getWebPvUvIpByDay() {
        const interval = parser.parseExpression(this.app.config.pvuvip_task_day_time);
        interval.prev();
        const endTime = new Date(interval.prev().toString());
        const beginTime = new Date(interval.prev().toString());
        const query = { create_time: { $gte: beginTime, $lt: endTime } };

        const datas = await this.ctx.model.Web.WebEnvironment.distinct('app_id', query).exec();
        this.groupData(datas, endTime, 2, query);
    }
    // 定时执行每分钟的数据
    async getWebPvUvIpByMinute() {
        const interval = parser.parseExpression(this.app.config.pvuvip_task_minute_time);
        interval.prev();
        const endTime = new Date(interval.prev().toString());
        const beginTime = new Date(endTime.getTime() - 60000);
        const query = { create_time: { $gte: beginTime, $lt: endTime } };

        const datas = await this.ctx.model.Web.WebEnvironment.distinct('app_id', query).exec();
        this.groupData(datas, endTime, 1, query);
    }
    // 对数据进行分组
    groupData(datas, endTime, type, query) {
        if (!datas && !datas.length) return;
        datas.forEach(item => {
            this.savePvUvIpData(item, endTime, type, query);
        });
    }

    // 获得pvuvip数据
    async savePvUvIpData(appId, endTime, type, query) {
        query.app_id = appId;

        const pv = Promise.resolve(this.ctx.model.Web.WebEnvironment.count(query).exec());
        const uv = Promise.resolve(this.ctx.model.Web.WebEnvironment.distinct('mark_user', query).exec());
        const ip = Promise.resolve(this.ctx.model.Web.WebEnvironment.distinct('ip', query).exec());
        const data = await Promise.all([ pv, uv, ip ]);

        const pvuvip = this.ctx.model.Web.WebPvuvip();
        pvuvip.app_id = appId;
        pvuvip.pv = data[0];
        pvuvip.uv = data[1].length;
        pvuvip.ip = data[2].length;
        pvuvip.create_time = endTime;
        pvuvip.type = type;

        await pvuvip.save().exec();
    }

}

module.exports = WebReportService;
