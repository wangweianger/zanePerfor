/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class AjaxsService extends Service {

    // 获得页面性能数据平均值
    async getPageAjaxsAvg(appId, url) {
        const datas = await this.ctx.model.Web.WebAjaxs.aggregate([
            { $match: { app_id: appId, call_url: url }, },
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
        ]).exec();

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
        const queryjson = { $match: { app_id: appId, speed_type: type }, }
        if (url) queryjson.$match.url = { $regex: new RegExp(url, 'i') };
        if (beginTime && endTime) queryjson.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        const group_id = {
            url: "$url",
            method:"$method",
        };

        // 请求总条数
        const count = await this.ctx.model.Web.WebAjaxs.aggregate([
            queryjson,
            {
                $group: {
                    _id: group_id,
                    count: { $sum: 1 },
                }
            },
        ]).exec();
        const datas = await this.ctx.model.Web.WebAjaxs.aggregate([
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
        ]).exec();

        return {
            datalist: datas,
            totalNum: count.length,
            pageNo: pageNo,
        };
    }

    // 获得单个api的平均性能数据
    async getOneAjaxAvg(appId, url) {
        const datas = await this.ctx.model.Web.WebAjaxs.aggregate([
            { $match: { app_id: appId, url: url }, },
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

    // 获得单个api的性能列表数据
    async getOneAjaxList(appId, url, pageNo, pageSize) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        // 请求总条数
        const count = await this.ctx.model.Web.WebAjaxs.aggregate([
            { $match: { app_id: appId, url: url }, },
        ]).exec();
        const datas = await this.ctx.model.Web.WebAjaxs.aggregate([
            { $match: { app_id: appId, url: url }, },
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

module.exports = AjaxsService;
