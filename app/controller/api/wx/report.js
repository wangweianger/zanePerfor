'use strict';

const Controller = require('egg').Controller;
let isKafkaConsumer = false;

class AjaxsController extends Controller {

    // 微信端用户数据上报
    async wxReport() {
        const { ctx } = this;
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Content-Type', 'application/json;charset=UTF-8');

        const query = ctx.request.body;
        if (!query.appId) throw new Error('wx端上报数据操作：app_id不能为空');
        query.ip = ctx.get('X-Real-IP') || ctx.get('X-Forwarded-For') || ctx.ip;

        if (this.app.config.report_data_type === 'redis') this.saveWxReportDataForRedis(query);
        if (this.app.config.report_data_type === 'kafka') this.saveWxReportDataForKafka(query);
        if (this.app.config.report_data_type === 'mongodb') this.saveWxReportDataForMongodb(ctx);

        ctx.body = {
            code: 1000,
            data: {},
        };
    }

    // 通过redis 消费者模式存储数据
    async saveWxReportDataForRedis(query) {
        if (this.app.config.redis_consumption.total_limit_wx) {
            // 限流
            const length = await this.app.redis.llen('wx_repore_datas');
            if (length >= this.app.config.redis_consumption.total_limit_wx) return;
        }
        this.app.redis.lpush('wx_repore_datas', JSON.stringify(query));
    }

    // 通过kafka 消息队列消费数据
    async saveWxReportDataForKafka(query) {
        // 生产者
        this.app.kafka.send(
            'wx',
            JSON.stringify(query)
        );

        // 消费者
        if (!isKafkaConsumer && !this.app.config.kafka.consumer.wx.isone) {
            this.ctx.service.wx.reportTask.saveWxReportDatasForKafka();
            isKafkaConsumer = true;
            this.app.config.kafka.consumer.wx.isone = true;
        }
    }

    // 通过mongodb 数据库存储数据
    async saveWxReportDataForMongodb(ctx) {
        ctx.service.wx.report.saveWxReportData(ctx);
    }

}

module.exports = AjaxsController;
