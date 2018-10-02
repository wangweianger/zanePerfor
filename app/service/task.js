'use strict';

const Service = require('egg').Service;

class DataTimedTaskService extends Service {

    // 把db2的数据经过加工之后同步到db3中 的定时任务
    async saveWebReportDatas() {
        const beginTime = await this.app.redis.get('web_task_begin_time');
        const endTime = new Date();
        beginTime ? await this.app.redis.set('web_task_begin_time', endTime) :
            await this.app.redis.set('web_task_begin_time', new Date());

        const datas = await this.ctx.model.Web.WebReport.where('create_time')
            .gt(beginTime)
            .lt(endTime)
            .exec();
        console.log('查询到的数据条数为:' + datas.length);
        return datas;
    }
}

module.exports = DataTimedTaskService;
