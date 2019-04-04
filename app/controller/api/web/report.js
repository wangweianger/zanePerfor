/* eslint-disable */
'use strict';
const Controller = require('egg').Controller;

class ReportController extends Controller {
    constructor(params) {
        super(params);
    }
    // web用户数据上报
    async webReport() {
        const { ctx } = this;
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Content-Type', 'application/json;charset=UTF-8');
        ctx.set('X-Response-Time', '2s');
        ctx.set('Connection', 'close');
        ctx.status = 200;

        const query = ctx.request.body;
        if (!query.appId) throw new Error('web端上报数据操作：app_id不能为空');

        query.ip = ctx.get('X-Real-IP') || ctx.get('X-Forwarded-For') || ctx.ip;
        query.url = query.url || ctx.headers.referer;
        query.user_agent = ctx.headers['user-agent'];

        if (this.app.config.report_data_type === 'redis') this.saveWebReportDataForRedis(query);
        if (this.app.config.report_data_type === 'kafka') this.saveWebReportDataForKafka(query);
        if (this.app.config.report_data_type === 'mongodb') this.saveWebReportDataForMongodb(ctx);
    }

    // 通过redis 消息队列消费数据
    async saveWebReportDataForRedis(query) {
        try {
            if (this.app.config.redis_consumption.total_limit_web){
                // 限流
                const length = await this.app.redis.llen('web_repore_datas');
                if (length >= this.app.config.redis_consumption.total_limit_web) return;
            }
            // 生产者
            this.app.redis.lpush('web_repore_datas', JSON.stringify(query));
        } catch (e) { console.log(e); }
    }

    // 通过kafka 消息队列消费数据
    async saveWebReportDataForKafka(query) {
        // 生产者
        this.app.kafka.send(
            'web',
            JSON.stringify(query)
        );
    }

    // 通过mongodb 数据库存储数据
    async saveWebReportDataForMongodb(ctx) {
        ctx.service.web.report.saveWebReportData(ctx);
    }
}

module.exports = ReportController;
