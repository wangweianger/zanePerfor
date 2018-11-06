/* eslint-disable */
'use strict';
const Controller = require('egg').Controller;

class ReportController extends Controller {

    // web用户数据上报
    async webReport() {
        const { ctx } = this;
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Credentials', true);
        ctx.set('Content-Type', 'application/json;charset=UTF-8');

        const query = ctx.request.body;
        if (!query.appId) throw new Error('web端上报数据操作：app_id不能为空');
        
        if (this.app.config.report_data_type === 'redis'){
            query.ip = ctx.get('X-Real-IP') || ctx.get('X-Forwarded-For') || ctx.ip;
            query.url = ctx.headers.referer;
            query.user_agent = ctx.headers['user-agent'];
            this.saveWebReportDataForRedis(query);
        } 
        if (this.app.config.report_data_type === 'mongodb') this.saveWebReportDataForMongodb(ctx);

        ctx.body = {
            code: 1000,
            data: {},
        };
    }

    // 通过redis 消费者模式存储数据
    async saveWebReportDataForRedis(query) {
        this.app.redis.lpush('web_repore_datas', JSON.stringify(query));
    }

    // 通过mongodb 数据库存储数据
    async saveWebReportDataForMongodb(ctx) {
        // 限流
        // const result = await this.limitUserFlow(ctx);
        ctx.service.web.webReport.saveWebReportData(ctx);
    }

    // 用户流量限制
    async limitUserFlow(ctx) {
        const query = ctx.request.body;
        const ip = ctx.get('X-Real-IP') || ctx.get('X-Forwarded-For') || ctx.ip;
        let result = 1;  // 0:表示请求无效  1：请求有效

        // 参数校验
        if (!query.appId) return 0;

        // 无限流
        if (!this.app.config.flow_limit.web.is_open) return 1;
        if (!this.app.config.flow_limit.web.every_user_limit && !this.app.config.flow_limit.web.total_limit) return 1;

        // 启用限流
        if (this.app.config.flow_limit.web.every_user_limit) {

        }
        if (this.app.config.flow_limit.web.total_limit) {

        }
    }

    // web端脚本获取
    async getWebScript() {
        const { ctx } = this;
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Content-Type', 'application/javascript; charset=utf-8');

        const result = await ctx.service.web.webPerformanceScript.getPerformanceScript(ctx);
        ctx.body = result;
    }
}

module.exports = ReportController;
