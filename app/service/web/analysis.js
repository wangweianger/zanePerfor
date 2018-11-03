/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class AnalysisService extends Service {

    // 用户漏斗分析列表
    async getAnalysislist(appId, beginTime, endTime, ip, pageNo, pageSize) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        const query = { $match: { app_id: appId }, };
        if (ip) query.$match.ip = ip;
        if (beginTime && endTime) query.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        return ip ? await this.oneThread(query, pageNo, pageSize)
            : await this.moreThread(appId, beginTime, endTime, query, pageNo, pageSize);
    }

    // 平均求值数多线程
    async moreThread(appId, beginTime, endTime, queryjson, pageNo, pageSize) {
        const result = [];
        let distinct = await this.ctx.model.Web.WebEnvironment.distinct('mark_user', queryjson.$match).exec() || [];
        let copdistinct = distinct;

        const betinIndex = (pageNo - 1) * pageSize;
        if (distinct && distinct.length) {
            distinct = distinct.slice(betinIndex, betinIndex + pageSize);
        }
        const resolvelist = [];
        for (let i = 0, len = distinct.length; i < len; i++) {
            resolvelist.push(
                Promise.resolve(
                    this.ctx.model.Web.WebEnvironment.aggregate([
                        { $match: { app_id: appId, mark_user: distinct[i], create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } } },
                        {
                            $group: {
                                _id: {
                                    ip: "$ip",
                                    markuser: "$mark_user",
                                    browser: "$browser",
                                    system: "$system",
                                },
                            }
                        },
                    ]).exec()
                )
            )
        }
        const all = await Promise.all(resolvelist) || [];
        all.forEach(item => {
            result.push(item[0]);
        })

        return {
            datalist: result,
            totalNum: copdistinct.length,
            pageNo: pageNo,
        };
    }

    // 单个api接口查询平均信息
    async oneThread(queryjson, pageNo, pageSize) {
        const count = Promise.resolve(this.ctx.model.Web.WebEnvironment.distinct('mark_user', queryjson.$match).exec());
        const datas = Promise.resolve(
            this.ctx.model.Web.WebEnvironment.aggregate([
                queryjson,
                {
                    $group: {
                        _id: {
                            ip: "$ip",
                            markuser: "$mark_user",
                            browser: "$browser",
                            system: "$system",
                        },
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

    // 单个用户行为轨迹列表
    async getAnalysisOneList(appId, markuser) {
        return await this.ctx.model.Web.WebEnvironment.find({ app_id: appId, mark_user: markuser }).sort({cerate_time:1}) || {};
    }
}

module.exports = AnalysisService;
