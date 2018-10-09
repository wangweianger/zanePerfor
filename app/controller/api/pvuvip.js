'use strict';
const parser = require('cron-parser');
const Controller = require('egg').Controller;

class PvUvIpController extends Controller {

    // 新增系统
    async getPvUvIpInterval() {
        const { ctx } = this;
        const timeList = await this.getTimeList(ctx);
        const result = await ctx.service.web.webPvuvip.getPvUvIpData(ctx);
        
        ctx.body = this.app.result({
            data: timeList,
        });
    }

    async getTimeList(ctx) {
        const query = ctx.request.body;
        const type = query.type || 'm';
        const appId = query.appId;
        const beginTime = query.beginTime;
        const endTime = query.endTime;
        // 参数校验
        if (!appId) throw new Error('界面查询pvuvip：appId不能为空');
        if (!beginTime) throw new Error('界面查询pvuvip：beginTime不能为空');
        if (!endTime) throw new Error('界面查询pvuvip：endTime不能为空');

        const result = [];

        let timestr = '';
        if (type === 'm') {
            timestr = '0 */1 * * * *';
        } else if (type === 'h') {
            timestr = '0 0 */1 * * *';
        } else if (type === 'd') {
            timestr = '0 0 0 */1 * *';
        }

        const options = {
            currentDate: new Date(beginTime),
            endDate: new Date(endTime),
            iterator: true,
        };
        const interval = parser.parseExpression(timestr, options);
        while (true) { // eslint-disable-line
            try {
                const obj = interval.next();
                const timer = this.app.format(new Date(obj.value.toString()), 'yyyy/MM/dd HH:mm:ss');
                result.push({
                    time: timer,
                    pv: 0,
                    uv: 0,
                    ip: 0,
                });
            } catch (e) {
                break;
            }
        }
        return result;
    }
}

module.exports = PvUvIpController;
