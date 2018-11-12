'use strict';

const Controller = require('egg').Controller;

class AjaxsController extends Controller {

    // 微信端用户数据上报
    async wxReport() {
        const { ctx } = this;
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Content-Type', 'application/json;charset=UTF-8');

        const query = ctx.request.body;
        if (!query.appId) throw new Error('wx端上报数据操作：app_id不能为空');

        if (this.app.config.report_data_type === 'redis') {
            query.ip = ctx.get('X-Real-IP') || ctx.get('X-Forwarded-For') || ctx.ip;
            this.saveWxReportDataForRedis(query);
        }
        if (this.app.config.report_data_type === 'mongodb') this.saveWxReportDataForMongodb(ctx);

        ctx.body = {
            code: 1000,
            data: {},
        };

        const list = await ctx.service.wx.report.saveWxReportData(ctx);

        ctx.body = {
            code: 1000,
            data: list,
        };
    }

    // 通过redis 消费者模式存储数据
    async saveWxReportDataForRedis(query) {
        if (this.app.config.redis_consumption.total_limit_wx) {
            // 限流
            const length = await this.app.redis.llen('web_repore_datas');
            if (length >= this.app.config.redis_consumption.total_limit_wx) return;
        }
        this.app.redis.lpush('wx_repore_datas', JSON.stringify(query));
    }

    // 通过mongodb 数据库存储数据
    async saveWxReportDataForMongodb(ctx) {
        ctx.service.wx.wxReport.saveWxReportData(ctx);
    }

}

module.exports = AjaxsController;
