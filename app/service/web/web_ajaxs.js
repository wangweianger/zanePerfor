/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class AjaxsService extends Service {

    // 获得页面性能数据平均值
    async getPageAjaxs(appId, url, pageNo, pageSize) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        // 请求总条数
        const count = await this.ctx.model.Web.WebAjaxs.aggregate([
            { $match: { app_id: appId, call_url: url }, },
        ]).exec();
        const datas = await this.ctx.model.Web.WebAjaxs.aggregate([
            { $match: { app_id: appId, call_url: url }, },
            { $skip: (pageNo-1) * pageSize  },
            { $limit: pageSize },
            { $sort: { create_time: -1 } },
        ]).exec();

        return {
            datalist: datas,
            totalNum: count.length,
            pageNo: pageNo,
        };
    }
}

module.exports = AjaxsService;
