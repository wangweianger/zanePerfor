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

        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        // 查询参数拼接
        const queryjson = { $match: { app_id: appId }, }
        if (type) queryjson.$match.type = type;
        if (url) queryjson.$match.name = { $regex: new RegExp(name, 'i') };
        if (beginTime && endTime) queryjson.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        const group_id = {
            name: "$name",
            type: "$type",
            msg: "$msg",
        };

        const count = Promise.resolve(
            this.ctx.model.Wx.WxErrors.aggregate([
                queryjson,
                {
                    $group: {
                        _id: group_id,
                        count: { $sum: 1 },
                    }
                },
            ]).exec()
        );
        const datas = Promise.resolve(
            this.ctx.model.Wx.WxErrors.aggregate([
                queryjson,
                {
                    $group: {
                        _id: group_id,
                        count: { $sum: 1 },
                    }
                },
                { $skip: (pageNo - 1) * pageSize },
                { $sort: { count: -1 } },
                { $limit: pageSize },
            ]).exec()
        );
        const all = await Promise.all([count, datas]);

        return {
            datalist: all[1],
            totalNum: all[0].length,
            pageNo: pageNo,
        };
    }

    // 获得单个Error列表
    async getOneErrorList(appId, url, category, pageNo, pageSize, beginTime, endTime) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        const query = { app_id: appId, name: url, type: category }
        if (beginTime && endTime) query.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        const count = Promise.resolve(this.ctx.model.Wx.WxErrors.count(query).exec());
        const datas = Promise.resolve(
            this.ctx.model.Wx.WxErrors.aggregate([
                { $match: query, },
                { $sort: { create_time: -1 } },
                { $skip: (pageNo - 1) * pageSize },
                { $limit: pageSize },
            ]).exec()
        );
        const all = await Promise.all([count, datas]);

        return {
            datalist: all[1],
            totalNum: all[0],
            pageNo: pageNo,
        };
    }

    // 单个error详情信息
    async getErrorDetail(id) {
        return await this.ctx.model.Wx.WxErrors.findOne({ _id: id }).exec() || {};
    }

}

module.exports = ErroesService;
