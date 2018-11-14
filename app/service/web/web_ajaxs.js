/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class AjaxsService extends Service {

    // 获得页面性能数据平均值
    async getPageAjaxsAvg(appId, url, beginTime, endTime) {
        const query = { $match: { app_id: appId, call_url: url }, };
        if (beginTime && endTime) query.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };
        const datas = await this.ctx.model.Web.WebAjaxs.aggregate([
            query,
            {
                $group: {
                    _id: {
                        url: "$url",
                        method: "$method",
                    },
                    count: { $sum: 1 },
                    body_size: { $avg: "$decoded_body_size" }, 
                    duration: { $avg: "$duration" }, 
                }
            },
        ]).read('sp').exec();

        return {
            datalist: datas,
            totalNum: 0,
            pageNo: 1,
        };
    }

    // 获得AJAX性能数据平均值
    async getAverageAjaxList(ctx) {
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
        const queryjson = { $match: { speed_type: type, app_id: appId }, }
        if (url) queryjson.$match.url = { $regex: new RegExp(url, 'i') };
        if (beginTime && endTime) queryjson.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        const group_id = {
            url: "$url",
            method:"$method",
        };

        return url ? await this.oneThread(queryjson, pageNo, pageSize, group_id) 
            : await this.moreThread(appId, type, beginTime,endTime,queryjson, pageNo, pageSize, group_id);
    }

    // 平均求值数多线程
    async moreThread(appId, type, beginTime,endTime,queryjson, pageNo, pageSize, group_id){
        const result = [];
        let distinct = await this.ctx.model.Web.WebAjaxs.distinct('url', queryjson.$match).read('sp').exec() || [];
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
                    this.ctx.model.Web.WebAjaxs.aggregate([
                        { $match: { speed_type: type, app_id: appId, url: distinct[i], create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } } },
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
        } );

        return {
            datalist: result,
            totalNum: copdistinct.length,
            pageNo: pageNo,
        };
    }

    // 单个api接口查询平均信息
    async oneThread(queryjson, pageNo, pageSize, group_id) {
        const count = Promise.resolve(this.ctx.model.Web.WebAjaxs.distinct('url', queryjson.$match).read('sp').exec());
        const datas = Promise.resolve(
            this.ctx.model.Web.WebAjaxs.aggregate([
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
                { $sort: { count: -1 } },
                { $limit: pageSize },
            ]).read('sp').exec()
        );
        const all = await Promise.all([count, datas]);
        return {
            datalist: all[1],
            totalNum: all[0].length,
            pageNo: pageNo,
        };
    }

    // 获得单个api的平均性能数据
    async getOneAjaxAvg(appId, url, beginTime, endTime, type) {
        type = type * 1;
        const query = { $match: { app_id: appId, url: url, speed_type: type}, };
        if (beginTime && endTime) query.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        const datas = await this.ctx.model.Web.WebAjaxs.aggregate([
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

    // 获得单个api的性能列表数据
    async getOneAjaxList(appId, url, pageNo, pageSize, beginTime, endTime, type) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;
        type = type * 1;

        const query = { $match: { app_id: appId, url: url, speed_type: type }, };
        if (beginTime && endTime) query.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };
        const count = Promise.resolve(this.ctx.model.Web.WebAjaxs.count(query.$match).exec());
        const datas = Promise.resolve(
            this.ctx.model.Web.WebAjaxs.aggregate([
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

    // 获得单个ajax详情信息
    async getOneAjaxDetail(id) {
        return await this.ctx.model.Web.WebAjaxs.findOne({ _id: id }).read('sp').exec() || {};
    }
}

module.exports = AjaxsService;
