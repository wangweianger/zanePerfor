/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class PvuvivService extends Service {

    // 获得页面性能数据平均值
    async getAveragePageList(appId, type, pageNo, pageSize, beginTime, endTime) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;
        type = type * 1;
        
        const query = { $match: { app_id: appId, speed_type: type } };
        if (beginTime && endTime)
            query.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };
        // 请求总条数
        const count = await this.ctx.model.Web.WebPages.aggregate([
            query,
            {$group: { _id: "$url",count: { $sum: 1 },}},
        ]).exec();
        // 请求分页数据
        const datas = await this.ctx.model.Web.WebPages.aggregate([
            query,
            { $group: { 
                _id: "$url", 
                count: { $sum: 1 }, 
                load_time: { $avg: "$load_time" }, 
                dns_time: { $avg: "$dns_time" }, 
                tcp_time: { $avg: "$tcp_time" }, 
                dom_time: { $avg: "$dom_time" }, 
                white_time: { $avg: "$white_time" }, 
                redirect_time: { $avg: "$redirect_time" }, 
                unload_time: { $avg: "$unload_time" }, 
                request_time: { $avg: "$request_time" }, 
                analysisDom_time: { $avg: "$analysisDom_time" }, 
                ready_time: { $avg: "$ready_time" }, 
            } },
            { $skip: (pageNo-1) * pageSize  },
            { $limit: pageSize },
            { $sort: { count: -1 } },
        ]).exec();

        return {
            datalist: datas,
            totalNum: count.length,
            pageNo: pageNo,
        };
    }
}

module.exports = PvuvivService;
