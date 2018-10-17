/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class PagesService extends Service {

    // 获得页面性能数据平均值
    async getAveragePageList(ctx) {
        const query = ctx.request.query;
        const appId = query.appId;
        let type = query.type || 1;
        let pageNo = query.pageNo || 1;
        let pageSize = query.pageSize || this.app.config.pageSize;
        const beginTime = query.beginTime;
        const endTime = query.endTime;
        const url = query.url;

        pageNo = pageNo * 1;
        pageSize = pageSize * 1;
        type = type * 1;

        // 查询参数拼接
        const queryjson = { $match: { app_id: appId, speed_type: type }, }
        if (url) queryjson.$match.url = { $regex: new RegExp(url, 'i') };
        if (beginTime && endTime) queryjson.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        const group_id = { 
            url: "$url", 
        };

        // 请求总条数
        const count = await this.ctx.model.Web.WebPages.aggregate([
            queryjson,
            {
                $group: { 
                    _id: group_id,
                    count: { $sum: 1 },
                }
            },
        ]).exec();
        const datas = await this.ctx.model.Web.WebPages.aggregate([
            queryjson,
            { $group: { 
                _id: group_id,
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

    // 单个页面性能数据列表
    async getOnePageList(ctx) {
        const query = ctx.request.query;
        const appId = query.appId;
        let type = query.type || 1;
        let pageNo = query.pageNo || 1;
        let pageSize = query.pageSize || this.app.config.pageSize;
        const beginTime = query.beginTime;
        const endTime = query.endTime;
        const url = query.url;

        pageNo = pageNo * 1;
        pageSize = pageSize * 1;
        type = type * 1;

        // 查询参数拼接
        const queryjson = { $match: { url: url, app_id: appId, speed_type: type }, }

        if (beginTime && endTime) queryjson.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        // 请求总条数
        const count = await this.ctx.model.Web.WebPages.aggregate([
            queryjson,
        ]).exec();
        const datas = await this.ctx.model.Web.WebPages.aggregate([
            queryjson,
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

    // 单页页面性能数据列表（简单版本）
    async getPagesForType(appId, url, speedType, pageNo, pageSize) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;
        speedType = speedType * 1;

        // 请求总条数
        const count = await this.ctx.model.Web.WebPages.aggregate([
            { $match: { app_id: appId, url: url, speed_type: speedType }, },
        ]).exec();
        const datas = await this.ctx.model.Web.WebPages.aggregate([
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

    // 单个页面详情
    async getPageDetails(appId, id) {
        return await this.ctx.model.Web.WebPages.findOne({ app_id: appId, _id: id }).exec();
    }
}

module.exports = PagesService;
