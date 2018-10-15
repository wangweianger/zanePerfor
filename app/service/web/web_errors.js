/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class ErroesService extends Service {

    // 获得ERROR类型列表
    async getAverageErrorList(ctx) {
        const query = ctx.request.query;
        const appId = query.appId;
        let type = query.type;
        let pageNo = query.pageNo || 1;
        let pageSize = query.pageSize || this.app.config.pageSize;
        const beginTime = query.beginTime;
        const endTime = query.endTime;
        const url = query.url;
        const city = query.city;
        const isCity = query.isCity;
        const isBrowser = query.isBrowser;
        const isSystem = query.isSystem;

        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        // 查询参数拼接
        const queryjson = { $match: { app_id: appId }, }
        if (type) queryjson.$match.category = type;
        if (url) queryjson.$match.resource_url = { $regex: new RegExp(url, 'i') };
        if (city) queryjson.$match.city = city;
        if (beginTime && endTime) queryjson.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        console.log(queryjson)

        const lookup = {
            $lookup: {
                from: "webenvironments",
                localField: "mark_page",
                foreignField: "mark_page",
                as: "fromItems"
            }
        }
        const group_id = {
            resourceurl: "$resource_url",
            category: "$category",
            msg: "$msg",
            city: `${isCity == 'true' ? "$city" : ""}`,
            browser: `${isBrowser == 'true' ? "$browser" : ""}`,
            system: `${isSystem == 'true' ? "$system" : ""}`,
        };

        // 请求总条数
        const count = await this.ctx.model.Web.WebErrors.aggregate([
            lookup,
            { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$fromItems", 0] }, "$$ROOT"] } } },
            { $project: { fromItems: 0 } },
            queryjson,
            {
                $group: {
                    _id: group_id,
                    count: { $sum: 1 },
                }
            },
        ]).exec();
        const datas = await this.ctx.model.Web.WebErrors.aggregate([
            lookup,
            { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$fromItems", 0] }, "$$ROOT"] } } },
            { $project: { fromItems: 0 } },
            queryjson,
            {
                $group: {
                    _id: group_id,
                    count: { $sum: 1 },
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

    // 获得单个Error列表
    async getOneErrorList(appId, url, category, pageNo, pageSize) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        const query = { app_id: appId, resource_url: url, category: category }
        const lookup = {
            $lookup: {
                from: "webenvironments",
                localField: "mark_page",
                foreignField: "mark_page",
                as: "fromItems"
            }
        }

        // 请求总条数
        const count = await this.ctx.model.Web.WebErrors.aggregate([
            { $match: query, },
            lookup,
        ]).exec();
        // 列表信息
        const datas = await this.ctx.model.Web.WebErrors.aggregate([
            { $match: query, },
            lookup,
            { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$fromItems", 0] }, "$$ROOT"] } } },
            { $project: { fromItems: 0 } },
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

    // 单个error详情信息
    async getErrorDetail(appId, markPage) {
        // const datas = await this.ctx.model.Web.WebErrors.findOne({ app_id: appId, _id: id }).exec();
        const datas = await this.ctx.model.Web.WebErrors.aggregate([
            { $match: { app_id: appId, mark_page: markPage }, },
            {
                $lookup: {
                    from: "webenvironments",
                    localField: "mark_page",
                    foreignField: "mark_page",
                    as: "fromItems"
                }
            },
            { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$fromItems", 0] }, "$$ROOT"] } } },
            { $project: { fromItems: 0 } },
        ]).exec();
        console.log(datas)
        return datas && datas.length ? datas[0] : {};
    }

}

module.exports = ErroesService;
