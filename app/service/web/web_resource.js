/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class ResourceService extends Service {

    // 单页页面性能数据列表（简单版本）
    async getResourceForType(appId, url, speedType, pageNo, pageSize) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;
        speedType = speedType * 1;

        // 请求总条数
        const count = await this.ctx.model.Web.WebResource.aggregate([
            { $match: { app_id: appId, url: url, speed_type: speedType }, },
        ]).exec();
        const datas = await this.ctx.model.Web.WebResource.aggregate([
            { $match: { app_id: appId, url: url, speed_type: speedType }, },
            { $skip: (pageNo - 1) * pageSize },
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

module.exports = ResourceService;
