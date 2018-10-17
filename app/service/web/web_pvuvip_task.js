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
        const datas = await this.ctx.model.Web.WebEnvironment.find(query)
            .exec();
        this.groupData(datas, endTime, 2);
    }
    // 定时执行每分钟的数据
    async getWebPvUvIpByMinute() {
        const interval = parser.parseExpression(this.app.config.pvuvip_task_minute_time);
        interval.prev();
        const endTime = new Date(interval.prev().toString());
        const beginTime = new Date(endTime.getTime() - 60000);

        const query = { create_time: { $gte: beginTime, $lt: endTime } };
        const datas = await this.ctx.model.Web.WebEnvironment.find(query)
            .exec();
        this.groupData(datas, endTime, 1);
    }
    // 对数据进行分组
    groupData(datas, endTime, type) {
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
            this.savePvUvIpData(obj[key], key, endTime, type);
        }
    }

    // 获得pvuvip数据
    async savePvUvIpData(data, appId, endTime, type) {
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
        pvuvip.type = type;

        await pvuvip.save();
    }

}

module.exports = WebReportService;
