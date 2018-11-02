/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class AnalysisService extends Service {

    // 用户漏斗分析列表
    async getAnalysislist(appId, beginTime, endTime, ip, pageNo, pageSize) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        const query = { $match: { app_id: appId }, };
        if (ip) queryjson.$match.ip = ip;
        if (beginTime && endTime) query.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        const count = Promise.resolve(this.ctx.model.Web.WebEnvironment.distinct('mark_user', query.$match).exec());
        const datas = Promise.resolve(
            this.ctx.model.Web.WebEnvironment.aggregate([
                query,
                {
                    $group: {
                        _id: {
                            ip: "$ip",
                            markuser:"$mark_user",
                            browser:"$browser",
                            system:"$system",
                        },
                    }
                },
                { $skip: (pageNo - 1) * pageSize },
                { $sort: { count: -1 } },
                { $limit: pageSize },
            ]).exec()
        );

        const all = await Promise.all([ count, datas ]);

        return {
            datalist: all[1],
            totalNum: all[0].length,
            pageNo: 1,
        };
    }

    // 单个用户行为轨迹列表
    async getAnalysisOneList(appId, markuser) {
        return await this.ctx.model.Web.WebEnvironment.find({ app_id: appId, mark_user: markuser }).sort({cerate_time:1}) || {};
    }
}

module.exports = AnalysisService;
