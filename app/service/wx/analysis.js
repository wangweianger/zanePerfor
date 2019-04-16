'use strict';

const Service = require('egg').Service;

class AnalysisService extends Service {

    // 用户漏斗分析列表
    async getAnalysislist(appId, beginTime, endTime, ip, pageNo, pageSize) {
        pageNo = pageNo * 1;
        pageSize = pageSize * 1;

        const query = { $match: { } };
        if (ip) query.$match.ip = ip;
        if (beginTime && endTime) query.$match.create_time = { $gte: new Date(beginTime), $lte: new Date(endTime) };

        return ip ? await this.oneThread(appId, query, pageNo, pageSize)
            : await this.moreThread(appId, beginTime, endTime, query, pageNo, pageSize);
    }

    // 平均求值数多线程
    async moreThread(appId, beginTime, endTime, queryjson, pageNo, pageSize) {
        const result = [];
        let distinct = await this.app.models.WxPages(appId).distinct('mark_user', queryjson.$match).exec() || [];
        const copdistinct = distinct;

        const betinIndex = (pageNo - 1) * pageSize;
        if (distinct && distinct.length) {
            distinct = distinct.slice(betinIndex, betinIndex + pageSize);
        }
        const resolvelist = [];
        for (let i = 0, len = distinct.length; i < len; i++) {
            resolvelist.push(
                Promise.resolve(
                    this.app.models.WxPages(appId).aggregate([
                        { $match: { mark_user: distinct[i], create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } } },
                        {
                            $group: {
                                _id: {
                                    ip: '$ip',
                                    markuser: '$mark_user',
                                    brand: '$brand',
                                    system: '$system',
                                },
                            },
                        },
                    ]).read('sp')
                        .exec()
                )
            );
        }
        const all = await Promise.all(resolvelist) || [];
        all.forEach(item => {
            result.push(item[0]);
        });

        return {
            datalist: result,
            totalNum: copdistinct.length,
            pageNo,
        };
    }

    // 单个api接口查询平均信息
    async oneThread(appId, queryjson, pageNo, pageSize) {
        const count = Promise.resolve(this.app.models.WxPages(appId).distinct('mark_user', queryjson.$match).exec());
        const datas = Promise.resolve(
            this.app.models.WxPages(appId).aggregate([
                queryjson,
                {
                    $group: {
                        _id: {
                            ip: '$ip',
                            markuser: '$mark_user',
                            brand: '$brand',
                            system: '$system',
                        },
                    },
                },
                { $skip: (pageNo - 1) * pageSize },
                { $sort: { count: -1 } },
                { $limit: pageSize },
            ]).read('sp')
                .exec()
        );
        const all = await Promise.all([ count, datas ]);
        return {
            datalist: all[1],
            totalNum: all[0].length,
            pageNo,
        };
    }

    // 单个用户行为轨迹列表
    async getAnalysisOneList(appId, markuser) {
        return await this.app.models.WxPages(appId).find({ mark_user: markuser }).read('sp')
            .sort({ create_time: 1 }) || {};
    }

    // TOP datas
    async getTopDatas(appId, beginTime, endTime, type) {
        type = type * 1;
        let result = {};
        if (type === 1) {
            const pages = Promise.resolve(this.getRealTimeTopPages(appId, beginTime, endTime));
            const jump = Promise.resolve(this.getRealTimeTopJumpOut(appId, beginTime, endTime));
            const brand = Promise.resolve(this.getRealTimeTopBrand(appId, beginTime, endTime));
            const province = Promise.resolve(this.getRealTimeTopProvince(appId, beginTime, endTime));
            const all = await Promise.all([ pages, jump, brand, province ]);
            result = { top_pages: all[0], top_jump_out: all[1], top_brand: all[2], provinces: all[3] };
        } else if (type === 2) {
            result = await this.getDbTopAnalysis(appId, beginTime, endTime) || {};
        }
        return result;
    }
    // 历史 top
    async getDbTopAnalysis(appId, beginTime, endTime) {
        const data = await this.ctx.model.Wx.WxStatis.findOne({ app_id: appId, create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } });
        if (data) return data;
        // 不存在则储存
        return await this.saveRealTimeTopTask(appId, 2, beginTime, endTime);
    }
    // top 页面
    async getRealTimeTopPages(appId, beginTime, endTime) {
        let result = await this.app.redis.get(`${appId}_top_pages_realtime`);
        result = result ? JSON.parse(result) : await this.getRealTimeTopPagesForDb(appId, beginTime, endTime);
        return result;
    }
    async getRealTimeTopPagesForDb(appId, beginTime, endTime, type) {
        try {
            const result = await this.app.models.WxPages(appId).aggregate([
                { $match: { create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } } },
                {
                    $group: {
                        _id: { url: '$path' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: this.app.config.top_alalysis_size.wx || 10 },
            ]).read('sp')
                .exec();
            // 每分钟执行存储到redis
            if (type === 1) this.app.redis.set(`${appId}_top_pages_realtime`, JSON.stringify(result));
            return result;
        } catch (err) { console.log(err); }
    }

    // top跳出率
    async getRealTimeTopJumpOut(appId, beginTime, endTime) {
        let result = await this.app.redis.get(`${appId}_top_jump_out_realtime`);
        result = result ? JSON.parse(result) : await this.getRealTimeTopJumpOutForDb(appId, beginTime, endTime);
        return result;
    }
    async getRealTimeTopJumpOutForDb(appId, beginTime, endTime, type) {
        try {
            /* eslint-disable */
            const option = {
                map: function () { emit(this.mark_user, this.path); },
                reduce: function (key, values) {
                    return values.length === 1;
                },
                query: { create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } },
                out: { replace: 'collectionName' },
            }
            /* eslint-enable */
            const res = await this.app.models.WxPages(appId).mapReduce(option);
            const result = await res.model.aggregate([
                { $match: { value: { $ne: false } } },
                {
                    $group: {
                        _id: { value: '$value' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: this.app.config.top_alalysis_size.wx || 10 },
            ]).exec();
            if (type === 1) this.app.redis.set(`${appId}_top_jump_out_realtime`, JSON.stringify(result));
            return result;
        } catch (err) { console.log(err); }
    }

    // top 手机品牌
    async getRealTimeTopBrand(appId, beginTime, endTime) {
        let result = await this.app.redis.get(`${appId}_top_brand_realtime`);
        result = result ? JSON.parse(result) : await this.getRealTimeTopBrandForDb(appId, beginTime, endTime);
        return result;
    }
    async getRealTimeTopBrandForDb(appId, beginTime, endTime, type) {
        try {
            const result = await this.app.models.WxPages(appId).aggregate([
                { $match: { create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } } },
                {
                    $group: {
                        _id: { brand: '$brand' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: this.app.config.top_alalysis_size.wx || 10 },
            ]).read('sp')
                .exec();
            // 每分钟执行存储到redis
            if (type === 1) this.app.redis.set(`${appId}_top_brand_realtime`, JSON.stringify(result));
            return result;
        } catch (err) { console.log(err); }
    }

    // 省份排行榜
    async getRealTimeTopProvince(appId, beginTime, endTime) {
        let result = await this.app.redis.get(`${appId}_top_province_realtime`);
        result = result ? JSON.parse(result) : await this.getRealTimeTopProvinceForDb(appId, beginTime, endTime);
        return result;
    }
    async getRealTimeTopProvinceForDb(appId, beginTime, endTime, type) {
        try {
            const result = await this.app.models.WxPages(appId).aggregate([
                { $match: { create_time: { $gte: new Date(beginTime), $lte: new Date(endTime) } } },
                {
                    $group: {
                        _id: { province: '$province' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
            ]).read('sp')
                .exec();
            // 每分钟执行存储到redis
            if (type === 1) this.app.redis.set(`${appId}_top_province_realtime`, JSON.stringify(result));
            return result;
        } catch (err) { console.log(err); }
    }

    // top排行榜 Task任务
    async saveRealTimeTopTask(appId, type, begin, end) {
        try {
            let beginTime = begin;
            let endTime = end;
            if (type === 1) {
                beginTime = this.app.format(new Date(), 'yyyy/MM/dd') + ' 00:00:00';
                endTime = new Date();
            }
            const pages = Promise.resolve(this.getRealTimeTopPagesForDb(appId, beginTime, endTime, type));
            const jump = Promise.resolve(this.getRealTimeTopJumpOutForDb(appId, beginTime, endTime, type));
            const brand = Promise.resolve(this.getRealTimeTopBrandForDb(appId, beginTime, endTime, type));
            const province = Promise.resolve(this.getRealTimeTopProvinceForDb(appId, beginTime, endTime, type));
            this.getRealTimeTopPvUvIpAjax(appId, beginTime, endTime);

            if (type === 2) {
                // 每天数据存储到数据库
                const all = await Promise.all([ pages, jump, brand, province ]);
                const [ toppages, topjumpout, topbrand, provinces ] = all;

                const statis = this.ctx.model.Wx.WxStatis();
                statis.app_id = appId;
                statis.top_pages = toppages;
                statis.top_jump_out = topjumpout;
                statis.top_brand = topbrand;
                statis.provinces = provinces;
                statis.create_time = beginTime;
                const result = await statis.save();

                // 触发日报邮件
                this.ctx.service.wx.sendEmail.getDaliyDatas({
                    appId,
                    toppages,
                    topjumpout,
                    topbrand,
                    provinces,
                }, 'toplist');

                return result;
            }
        } catch (err) { console.log(err); }
    }

    // 定时获得实时流量统计
    async getRealTimeTopPvUvIpAjax(appId, beginTime, endTime) {
        const query = { create_time: { $gte: new Date(beginTime), $lt: new Date(endTime) } };
        const pvpro = Promise.resolve(this.ctx.service.wx.pvuvip.pv(appId, query));
        const uvpro = Promise.resolve(this.ctx.service.wx.pvuvip.uv(appId, query));
        const ippro = Promise.resolve(this.ctx.service.wx.pvuvip.ip(appId, query));
        const ajpro = Promise.resolve(this.ctx.service.wx.pvuvip.ajax(appId, query));
        const flpro = Promise.resolve(this.ctx.service.wx.pvuvip.flow(appId, query));
        const data = await Promise.all([ pvpro, uvpro, ippro, ajpro, flpro ]);

        const pv = data[0] || 0;
        const uv = data[1].length ? data[1][0].count : 0;
        const ip = data[2].length ? data[2][0].count : 0;
        const ajax = data[3] || 0;
        const flow = data[4].length ? data[4][0].amount : 0;
        this.app.redis.set(`${appId}_pv_uv_ip_realtime`, JSON.stringify({ pv, uv, ip, ajax, flow }));
    }

    // 省份流量统计
    async getProvinceAvgCount(appId, beginTime, endTime, type) {
        if (type) type = type * 1;
        if (type === 1) {
            let res = await this.app.redis.get(`${appId}_top_province_realtime`);
            res = res ? JSON.parse(res) : await this.getRealTimeTopProvinceForDb(appId, beginTime, endTime);
            return { provinces: res };
        } else if (type === 2) {
            return await this.getDbTopAnalysis(appId, beginTime, endTime);
        }
    }

}

module.exports = AnalysisService;
