/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class ResourceService extends Service {

    // 单页页面性能数据列表（简单版本）
    async getResourceForType(appId, url, speedType, pageNo, pageSize) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;
        speedType = speedType * 1;

        const query = { $match: { app_id: appId, url: url, speed_type: speedType }, };

        const count = Promise.resolve(this.ctx.model.Web.WebResource.count(query.$match));
        const datas = Promise.resolve(
            this.ctx.model.Web.WebResource.aggregate([
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

    // 获得resource平均性能列表
    async getAverageResourceList(ctx) {
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
        if (url) queryjson.$match.name = { $regex: new RegExp(url, 'i') };
        if (beginTime && endTime) queryjson.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        const group_id = {
            url: "$name",
            method: "$method",
        };

        const count = Promise.resolve(
            this.ctx.model.Web.WebResource.aggregate([
                queryjson,
                {
                    $group: {
                        _id: group_id,
                        count: { $sum: 1 },
                    }
                },
            ])
        );
        const datas = Promise.resolve(
            this.ctx.model.Web.WebResource.aggregate([
                queryjson,
                {
                    $group: {
                        _id: group_id,
                        count: { $sum: 1 },
                        duration: { $avg: "$duration" },
                        body_size: { $avg: "$decoded_body_size" },
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

    // 获得单个resourc的平均性能数据
    async getOneResourceAvg(appId, url, beginTime, endTime) {
        const query = { $match: { app_id: appId, name: url }, };
        if (beginTime && endTime) query.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        const datas = await this.ctx.model.Web.WebResource.aggregate([
            query,
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    duration: { $avg: "$duration" },
                    body_size: { $avg: "$decoded_body_size" },
                }
            },
        ]).exec();

        return datas && datas.length ? datas[0] : {};
    }

    // 获得单个resourc的性能列表数据
    async getOneResourceList(appId, url, pageNo, pageSize, beginTime, endTime) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        const query = { $match: { app_id: appId, name: url }, };
        if (beginTime && endTime) query.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        const count = Promise.resolve(this.ctx.model.Web.WebResource.count(query.$match));
        const datas = Promise.resolve(
            this.ctx.model.Web.WebResource.aggregate([
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

    // 获得单个Resource详情信息
    async getOneResourceDetail(appId, markPage) {
        return await this.ctx.model.Web.WebResource.findOne({ app_id: appId, mark_page: markPage }) || {};
    }
}

module.exports = ResourceService;
