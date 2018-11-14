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

        const count = Promise.resolve(this.ctx.model.Web.WebResource.count(query.$match).read('sp').exec());
        const datas = Promise.resolve(
            this.ctx.model.Web.WebResource.aggregate([
                query,
                { $sort: { create_time: -1 } },
                { $skip: (pageNo - 1) * pageSize },
                { $limit: pageSize },
            ]).read('sp').exec()
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

        return url ? await this.oneThread(queryjson, pageNo, pageSize, group_id)
            : await this.moreThread(appId, type, beginTime, endTime, queryjson, pageNo, pageSize, group_id);
    }

    // 平均求值数多线程
    async moreThread(appId, type, beginTime, endTime, queryjson, pageNo, pageSize, group_id) {
        const result = [];
        let distinct = await this.ctx.model.Web.WebResource.distinct('name', queryjson.$match).read('sp').exec() || [];
        let copdistinct = distinct;

        const betinIndex = (pageNo - 1) * pageSize;
        if (distinct && distinct.length) {
            distinct = distinct.slice(betinIndex, betinIndex + pageSize);
        }
        const resolvelist = [];
        for (let i = 0, len = distinct.length; i < len; i++) {
            resolvelist.push(
                Promise.resolve(
                    this.ctx.model.Web.WebResource.aggregate([
                        { $match: { speed_type: type, app_id: appId, name: distinct[i], create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } } },
                        {
                            $group: {
                                _id: group_id,
                                count: { $sum: 1 },
                                duration: { $avg: "$duration" },
                                body_size: { $avg: "$decoded_body_size" },
                            }
                        },
                    ]).read('sp').exec()
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

    // 单个api接口查询平均信息
    async oneThread(queryjson, pageNo, pageSize, group_id) {
        const count = Promise.resolve(this.ctx.model.Web.WebResource.distinct('name', queryjson.$match).read('sp').exec());
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
            ]).read('sp').exec()
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
        ]).read('sp').exec();

        return datas && datas.length ? datas[0] : {};
    }

    // 获得单个resourc的性能列表数据
    async getOneResourceList(appId, url, pageNo, pageSize, beginTime, endTime) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        const query = { $match: { app_id: appId, name: url }, };
        if (beginTime && endTime) query.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        const count = Promise.resolve(this.ctx.model.Web.WebResource.count(query.$match).read('sp').exec());
        const datas = Promise.resolve(
            this.ctx.model.Web.WebResource.aggregate([
                query,
                { $sort: { create_time: -1 } },
                { $skip: (pageNo - 1) * pageSize },
                { $limit: pageSize },
            ]).read('sp').exec()
        );
        const all = await Promise.all([count, datas]);

        return {
            datalist: all[1],
            totalNum: all[0],
            pageNo: pageNo,
        };
    }

    // 获得单个Resource详情信息
    async getOneResourceDetail(id) {
        return await this.ctx.model.Web.WebResource.findOne({ _id: id }).read('sp').exec() || {};
    }
}

module.exports = ResourceService;
