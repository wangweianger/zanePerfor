'use strict';
const parser = require('cron-parser');
const Service = require('egg').Service;

class RemoveService extends Service {


    // 定时删除原始上报数据 一天删一次
    async deleteDb1WebData(type = 'web') {
        try {
            const interval = parser.parseExpression(this.app.config.pvuvip_task_day_time);
            interval.prev();
            interval.prev();
            const endTime = new Date(interval.prev().toString());

            const query = { create_time: { $lt: endTime } };
            let result = '';
            if (type === 'web') {
                result = await this.ctx.model.Web.WebReport.remove(query).exec();
            } else if (type === 'wx') {
                result = await this.ctx.model.Wx.WxReport.remove(query).exec();
            }
            return result;
        } catch (err) {
            return {};
        }
    }

    // 清空db2 number日之前所有性能数据
    async deleteDb2WebData(number, type = 'web') {
        number = number * 1;
        const interval = parser.parseExpression(this.app.config.pvuvip_task_day_time);
        const endTime = new Date(new Date(interval.prev().toString()).getTime() - number * 86400000);
        const query = { create_time: { $lt: endTime } };
        let result = null;

        if (type === 'web') {
            // Ajax
            const remove1 = Promise.resolve(this.ctx.model.Web.WebAjaxs.remove(query).exec());
            // Pages
            const remove2 = Promise.resolve(this.ctx.model.Web.WebPages.remove(query).exec());
            // Environment
            const remove3 = Promise.resolve(this.ctx.model.Web.WebEnvironment.remove(query).exec());
            // Errors
            const remove4 = Promise.resolve(this.ctx.model.Web.WebErrors.remove(query).exec());
            // Resource
            const remove5 = Promise.resolve(this.ctx.model.Web.WebResource.remove(query).exec());
            result = await Promise.all([ remove1, remove2, remove3, remove4, remove5 ]);
        } else if (type === 'wx') {
            // Ajax
            const remove1 = Promise.resolve(this.ctx.model.Wx.WxAjaxs.remove(query).exec());
            // Pages
            const remove2 = Promise.resolve(this.ctx.model.Wx.WxPages.remove(query).exec());
            // Errors
            const remove3 = Promise.resolve(this.ctx.model.Wx.WxErrors.remove(query).exec());
            result = await Promise.all([ remove1, remove2, remove3 ]);
        }
        return result;
    }
}

module.exports = RemoveService;
