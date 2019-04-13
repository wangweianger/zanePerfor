'use strict';

const Controller = require('egg').Controller;

class ReportController extends Controller {

    // 微信端用户数据上报
    async wxReport() {
        const { ctx } = this;
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Content-Type', 'application/json;charset=UTF-8');
        ctx.set('X-Response-Time', '2s');
        ctx.set('Connection', 'close');
        ctx.status = 200;

        const query = ctx.request.body;
        if (!query.appId) throw new Error('wx端上报数据操作：app_id不能为空');

        query.ip = ctx.get('X-Real-IP') || ctx.get('X-Forwarded-For') || ctx.ip;

        if (this.app.config.report_data_type === 'redis') this.saveWxReportDataForRedis(query);
        if (this.app.config.report_data_type === 'kafka') this.saveWxReportDataForKafka(query);
        if (this.app.config.report_data_type === 'mongodb') this.saveWxReportDataForMongodb(ctx);
    }

    // 通过redis 消费者模式存储数据
    async saveWxReportDataForRedis(query) {
        try {
            if (this.app.config.redis_consumption.total_limit_wx) {
                // 限流
                const length = await this.app.redis.llen('wx_repore_datas');
                if (length >= this.app.config.redis_consumption.total_limit_wx) return;
            }
            this.app.redis.lpush('wx_repore_datas', JSON.stringify(query));
        } catch (e) { console.log(e); }
    }

    // 通过kafka 消息队列消费数据
    async saveWxReportDataForKafka(query) {
        // 生产者
        this.app.kafka.send(
            'wx',
            JSON.stringify(query)
        );
    }

    // 通过mongodb 数据库存储数据
    async saveWxReportDataForMongodb(ctx) {
        ctx.service.wx.report.saveWxReportData(ctx);
    }

}

module.exports = ReportController;
