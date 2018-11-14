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

        return url ? await this.oneThread(queryjson, pageNo, pageSize, group_id)
            : await this.moreThread(appId, type, beginTime, endTime, queryjson, pageNo, pageSize, group_id);
    }

    // 平均求值数多线程
    async moreThread(appId, type, beginTime, endTime, queryjson, pageNo, pageSize, group_id) {
        const result = [];
        let distinct = await this.ctx.model.Wx.WxErrors.distinct('name', queryjson.$match).read('sp').exec() || [];
        let copdistinct = distinct;

        const betinIndex = (pageNo - 1) * pageSize;
        if (distinct && distinct.length) {
            distinct = distinct.slice(betinIndex, betinIndex + pageSize);
        }
        const resolvelist = [];
        for (let i = 0, len = distinct.length; i < len; i++) {
            resolvelist.push(
                Promise.resolve(
                    this.ctx.model.Wx.WxErrors.aggregate([
                        (type ?
                            { $match: { app_id: appId, type: type, name: distinct[i], create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } } }
                            :
                            { $match: { app_id: appId, name: distinct[i], create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } } }
                        ),
                        {
                            $group: {
                                _id: group_id,
                                count: { $sum: 1 },
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
        const count = Promise.resolve(this.ctx.model.Wx.WxErrors.distinct('name', queryjson.$match).read('sp').exec());
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
            ]).read('sp').exec()
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

        const count = Promise.resolve(this.ctx.model.Wx.WxErrors.count(query).read('sp').exec());
        const datas = Promise.resolve(
            this.ctx.model.Wx.WxErrors.aggregate([
                { $match: query, },
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

    // 单个error详情信息
    async getErrorDetail(id) {
        return await this.ctx.model.Wx.WxErrors.findOne({ _id: id }).read('sp').exec() || {};
    }

}

module.exports = ErroesService;
