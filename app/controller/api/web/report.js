/* eslint-disable */
'use strict';
const Controller = require('egg').Controller;
class ReportController extends Controller {
    // web用户数据上报
    async webReport() {
        const { ctx } = this;
        ctx.set('Access-Control-Allow-Origin', '*');
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
        if (this.app.config.redis_consumption.total_limit_web){
            // 限流
            const length = await this.app.redis.llen('web_repore_datas');
            if (length >= this.app.config.redis_consumption.total_limit_web) return;
        }
        // 生产者
        this.app.redis.lpush('web_repore_datas', JSON.stringify(query));
    }

    // 通过mongodb 数据库存储数据
    async saveWebReportDataForMongodb(ctx) {
        ctx.service.web.webReport.saveWebReportData(ctx);
    }

    async write(){
        const beginTime = Date.now()
        for(let i=0;i<5000;i++){
            const pages = this.ctx.model.Web.WebPages();
            pages.app_id = '2575CEA7435DE9D8831CFBB6890F3835';
            pages.create_time = 1542111009014;
            if (i % 3 === 0){
                pages.url = 'http://127:18090/file00';
            } else if (i % 3 === 1){
                pages.url = 'http://127.0.0.1:18090/name';
            }else {
                pages.url = 'http://118090/wang';
            }
            pages.full_url = 'http://127.0.0.1:18090/file';
            pages.pre_url = 'http://127.0.0.1:18090/file';
            pages.speed_type = 1;
            pages.mark_page = '2575CEA7435DE9D8831CFBB6890F3835';
            pages.mark_user = this.app.randomString();
            pages.load_time = 10;
            pages.dns_time = 10;
            pages.tcp_time = 10;
            pages.dom_time = 10;
            pages.resource_list = '';
            pages.white_time = 10;
            pages.redirect_time = 10;
            pages.unload_time = 10;
            pages.request_time = 10;
            pages.analysisDom_time = 10;
            pages.ready_time = 10;
            pages.screenwidth = 100;
            pages.screenheight = 100;
            pages.save();
        }
        console.log(`time耗时：${Date.now() - beginTime}`)
    }

}

module.exports = ReportController;
