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

        const count = Promise.resolve(this.ctx.model.Web.WebPages.distinct('url', queryjson.$match));
        const datas = Promise.resolve(
            this.ctx.model.Web.WebPages.aggregate([
                queryjson,
                {
                    $group: {
                        _id: group_id,
                        count: { $sum: 1 },
                        load_time: { $avg: "$load_time" },
                        dns_time: { $avg: "$dns_time" },
                        tcp_time: { $avg: "$tcp_time" },
                        dom_time: { $avg: "$dom_time" },
                        white_time: { $avg: "$white_time" },
                        request_time: { $avg: "$request_time" },
                        analysisDom_time: { $avg: "$analysisDom_time" },
                        ready_time: { $avg: "$ready_time" },
                    }
                },
                { $skip: (pageNo - 1) * pageSize },
                { $limit: pageSize },
                { $sort: { count: -1 } },
            ])
        );
        const all = await Promise.all([count, datas]);

        return {
            datalist: all[1],
            totalNum: all[0].length,
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

        const count = Promise.resolve(this.ctx.model.Web.WebPages.count(queryjson.$match));
        const datas = Promise.resolve(
            this.ctx.model.Web.WebPages.aggregate([
                queryjson,
                { $skip: (pageNo - 1) * pageSize },
                { $limit: pageSize },
                { $sort: { create_time: -1 } },
            ])
        );
        const all = await Promise.all([count, datas]);

        return {
            datalist: all[1],
            totalNum: all[0],
            pageNo: pageNo,
        };
    }

    // 单页页面性能数据列表（简单版本）
    async getPagesForType(appId, url, speedType, pageNo, pageSize) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;
        speedType = speedType * 1;
        const query = { $match: { app_id: appId, url: url, speed_type: speedType }, };

        const count = Promise.resolve(this.ctx.model.Web.WebPages.count(query.$match));
        const datas = Promise.resolve(
            this.ctx.model.Web.WebPages.aggregate([
                query,
                { $skip: (pageNo - 1) * pageSize },
                { $limit: pageSize },
                { $sort: { create_time: -1 } },
            ])
        );
        const all = await Promise.all([count, datas]);

        return {
            datalist: all[1],
            totalNum: all[0],
            pageNo: pageNo,
        };
    }

    // 单个页面详情
    async getPageDetails(appId, id) {
        return await this.ctx.model.Web.WebPages.findOne({ app_id: appId, _id: id }).exec();
    }
}

module.exports = PagesService;
