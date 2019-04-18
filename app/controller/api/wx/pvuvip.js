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
        // 计算定时任务间隔
        const interval = parser.parseExpression(this.app.config.pvuvip_task_minute_time);
        const timer = interval.prev().toString();
        const timestrat = new Date(interval.prev().toString()).getTime();
        const betweenTime = Math.abs(new Date(timer).getTime() - timestrat);

        // 今日数据概况
        let result = await this.app.redis.get(`${appId}_pv_uv_ip_realtime`);
        if (result) result = JSON.parse(result);

        ctx.body = this.app.result({
            time: betweenTime,
            data: result || {},
        });
    }
    // 某日概况
    async getPvUvIpSurveyOne() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const beginTime = query.beginTime;
        const endTime = query.endTime;
        if (!appId) throw new Error('pvuvip概况统计：appId不能为空');
        if (!beginTime) throw new Error('pvuvip概况统计：beginTime不能为空');
        if (!endTime) throw new Error('pvuvip概况统计：endTime不能为空');

        const result = await ctx.service.wx.pvuvip.getPvUvIpSurveyOne(appId, beginTime, endTime);

        ctx.body = this.app.result({
            data: result,
        });
    }
    // 获得历史概况
    async getHistoryPvUvIplist() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        if (!appId) throw new Error('pvuvip获得历史概况：appId不能为空');
        const result = await ctx.service.wx.pvuvip.getHistoryPvUvIplist(appId);

        ctx.body = this.app.result({
            data: result,
        });
    }
    // 获得多条数据
    async getPvUvIpList() {
        const { ctx } = this;
        const query = ctx.request.body;
        const appId = query.appId;
        // 参数校验
        if (!appId) throw new Error('界面查询pvuvip：appId不能为空');

        // 计算定时任务间隔
        const interval = parser.parseExpression(this.app.config.pvuvip_task_minute_time);
        const timer = interval.prev().toString();
        const timestrat = new Date(interval.prev().toString()).getTime();
        const betweenTime = Math.abs(new Date(timer).getTime() - timestrat);

        const beginTime = query.beginTime || new Date(timestrat - betweenTime * 30);
        const endTime = query.endTime || new Date(timestrat);

        const datalist = await ctx.service.wx.pvuvip.getPvUvIpData(appId, beginTime, endTime) || [];
        const result = await this.getTimeList(beginTime, endTime, datalist);

        ctx.body = this.app.result({
            time: betweenTime,
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

        const interval = parser.parseExpression(this.app.config.pvuvip_task_minute_time);
        interval.prev();
        const endTime = query.endTime || new Date(interval.prev().toString());
        const beginTime = query.beginTime || new Date(interval.prev().toString());

        const datalist = await ctx.service.wx.pvuvip.getPvUvIpData(appId, beginTime, endTime) || [];
        let result = {};
        if (datalist.length) {
            result = {
                time: datalist[0].create_time,
                pv: datalist[0].pv || 0,
                uv: datalist[0].uv || 0,
                ip: datalist[0].ip || 0,
                ajax: datalist[0].ajax || 0,
                flow: parseInt((datalist[0].flow || 0) / 1024 / 1024),
            };
        } else {
            result = {
                time: this.app.format(endTime, 'yyyy/MM/dd hh:mm') + ':00',
                pv: 0,
                uv: 0,
                ip: 0,
                ajax: 0,
                flow: 0,
            };
        }
        ctx.body = this.app.result({
            data: result,
        });
    }
    // 获得时间列表
    async getTimeList(beginTime, endTime, datalist) {
        const result = [];
        const options = {
            currentDate: new Date(beginTime),
            endDate: new Date(endTime),
            iterator: true,
        };
        const interval = parser.parseExpression(this.app.config.pvuvip_task_minute_time, options);
        while (true) { // eslint-disable-line
            try {
                const obj = interval.next();
                const date = new Date(obj.value.toString());
                const timer = this.app.format(date, 'yyyy/MM/dd hh:mm:ss');
                const items = {
                    time: timer,
                    pv: 0,
                    uv: 0,
                    ip: 0,
                    ajax: 0,
                    flow: 0,
                };
                datalist.forEach(item => {
                    if (date.getTime() === new Date(item.create_time).getTime()) {
                        items.pv = item.pv || 0;
                        items.uv = item.uv || 0;
                        items.ip = item.ip || 0;
                        items.ajax = item.ajax || 0;
                        items.flow = parseInt((item.flow || 0) / 1024 / 1024);
                    }
                });
                result.push(items);
            } catch (e) {
                break;
            }
        }
        const length = result.length;
        if (length > 1) {
            const last = result[length - 1];
            if (!last.pv) result.splice(length - 1, 1);
        }
        return result;
    }
}

module.exports = PvUvIpController;
