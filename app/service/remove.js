'use strict';
const parser = require('cron-parser');
const Service = require('egg').Service;

class RemoveService extends Service {


    // 定时删除原始上报数据 一天删一次
    async deleteDb1WebData(type = 1) {
        const interval = parser.parseExpression(this.app.config.pvuvip_task_day_time);
        interval.prev();
        interval.prev();
        const endTime = new Date(interval.prev().toString());

        const query = { create_time: { $lt: endTime } };
        let result = '';
        if (type === 1) {
            result = await this.ctx.model.Web.WebReport.remove(query).exec();
        } else if (type === 2) {
            result = await this.ctx.model.Wx.WxReport.remove(query).exec();
        }
        return result;
    }

    // 清空db2 number日之前所有性能数据
    async deleteDb2WebData(number) {
        number = number * 1;
        const interval = parser.parseExpression(this.app.config.pvuvip_task_day_time);
        const endTime = new Date(new Date(interval.prev().toString()).getTime() - number * 86400000);
        const query = { create_time: { $lt: endTime } };

        // Ajax
        const remove1 = Promise.resolve(this.ctx.model.Web.WebAjaxs.remove(query));
        // Pages
        const remove2 = Promise.resolve(this.ctx.model.Web.WebPages.remove(query));
        // Environment
        const remove3 = Promise.resolve(this.ctx.model.Web.WebEnvironment.remove(query));
        // Errors
        const remove4 = Promise.resolve(this.ctx.model.Web.WebErrors.remove(query));
        // Resource
        const remove5 = Promise.resolve(this.ctx.model.Web.WebResource.remove(query));

        return await Promise.all([ remove1, remove2, remove3, remove4, remove5 ]);
    }
}

module.exports = RemoveService;
