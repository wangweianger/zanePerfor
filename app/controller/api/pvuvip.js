'use strict';
const parser = require('cron-parser');
const Controller = require('egg').Controller;

class PvUvIpController extends Controller {
    // 获得实时概况
    async getPvUvIpSurvey() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        if (!appId) throw new Error('pvuvip概况统计：appId不能为空');
        // 今日数据概况
        const endTime_today = new Date();
        const beginTime_today = this.app.format(endTime_today, 'yyyy/MM/dd') + ' 00:00:00';
        const result_today = await ctx.service.web.webPvuvip.getPvUvIpSurvey(appId, beginTime_today, endTime_today);

        // 昨日数据概况
        const endTime_yesterday = beginTime_today;
        const beginTime_yesterday = new Date(new Date(endTime_yesterday).getTime() - 86400000);
        const result_yesterday = await ctx.service.web.webPvuvip.getPvUvIpSurvey(appId, beginTime_yesterday, endTime_yesterday);

        ctx.body = this.app.result({
            data: {
                today: result_today,
                yesterday: result_yesterday,
            },
        });
    }
    // 获得多条数据
    async getPvUvIpList() {
        const { ctx } = this;
        const query = ctx.request.body;
        const appId = query.appId;
        // 参数校验
        if (!appId) throw new Error('界面查询pvuvip：appId不能为空');

        const timestrat = new Date().getTime();
        const beginTime = query.beginTime || new Date(timestrat - 3660000);
        const endTime = query.endTime || new Date(timestrat - 60000);

        const datalist = await ctx.service.web.webPvuvip.getPvUvIpData(appId, beginTime, endTime) || [];
        const result = await this.getTimeList(beginTime, endTime, datalist);

        ctx.body = this.app.result({
            data: result,
        });
    }
    // 获得单条数据
    async getPvUvIpOne() {
        const { ctx } = this;
        const query = ctx.request.body;
        const appId = query.appId;
        // 参数校验
        if (!appId) throw new Error('界面查询pvuvip：appId不能为空');

        const timestrat = new Date().getTime();
        const beginTime = new Date(timestrat - 120000);
        const endTime = new Date(timestrat - 60000);

        const datalist = await ctx.service.web.webPvuvip.getPvUvIpData(appId, beginTime, endTime) || [];
        let result = {};
        if (datalist.length) {
            result = {
                time: datalist[0].create_time,
                pv: datalist[0].pv,
                uv: datalist[0].uv,
                ip: datalist[0].ip,
            };
        } else {
            result = {
                time: this.app.format(endTime, 'yyyy/MM/dd HH:mm') + ':00',
                pv: 0,
                uv: 0,
                ip: 0,
            };
        }
        ctx.body = this.app.result({
            data: result,
        });
    }
    async getTimeList(beginTime, endTime, datalist) {
        const result = [];
        const options = {
            currentDate: new Date(beginTime),
            endDate: new Date(endTime),
            iterator: true,
        };
        const interval = parser.parseExpression(this.app.config.pvuvip_task_time, options);
        while (true) { // eslint-disable-line
            try {
                const obj = interval.next();
                const date = new Date(obj.value.toString());
                const timer = this.app.format(date, 'yyyy/MM/dd HH:mm:ss');
                const items = {
                    time: timer,
                    pv: 0,
                    uv: 0,
                    ip: 0,
                };
                datalist.forEach(item => {
                    if (date.getTime() === new Date(item.create_time).getTime()) {
                        items.pv = item.pv;
                        items.uv = item.uv;
                        items.ip = item.ip;
                    }
                });
                result.push(items);
            } catch (e) {
                break;
            }
        }
        return result;
    }
}

module.exports = PvUvIpController;
