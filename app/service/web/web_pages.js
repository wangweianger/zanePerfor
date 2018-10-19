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
        
        return url ? await this.oneThread(queryjson, pageNo, pageSize, group_id)
            : await this.moreThread(appId, type, beginTime, endTime, queryjson, pageNo, pageSize, group_id);

    }

    // 获得多个页面的平均性能数据
    async moreThread(appId, type, beginTime, endTime, queryjson, pageNo, pageSize, group_id) {
        const result = [];
        let distinct = await this.ctx.model.Web.WebPages.distinct('url', queryjson.$match) || [];
        let copdistinct = distinct;

        const betinIndex = (pageNo - 1) * pageSize;
        if (distinct && distinct.length) {
            distinct = distinct.slice(betinIndex, betinIndex + pageSize);
        }
        const resolvelist = [];
        for (let i = 0, len = distinct.length; i < len; i++) {
            queryjson.$match.url = distinct[i];
            resolvelist.push(
                Promise.resolve(
                    this.ctx.model.Web.WebPages.aggregate([
                        { $match: { app_id: appId, url: distinct[i], speed_type: type, create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } } },
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
                    ])
                )
            )
        }
        const all = await Promise.all(resolvelist) || [];
        all.forEach(item => {
            result.push(item[0]);
        })
        result.sort(function (obj1, obj2) {
            let val1 = obj1.count;
            let val2 = obj2.count;
            if (val1 < val2) {
                return 1;
            } else if (val1 > val2) {
                return -1;
            } else {
                return 0;
            }
        });

        return {
            datalist: result,
            totalNum: copdistinct.length,
            pageNo: pageNo,
        };
    }

    // 单个页面查询平均信息
    async oneThread(queryjson, pageNo, pageSize, group_id) {
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
