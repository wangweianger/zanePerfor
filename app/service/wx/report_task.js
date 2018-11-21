'use strict';

const Service = require('egg').Service;
const fs = require('fs');
const path = require('path');
class WxReportTaskService extends Service {

    constructor(params) {
        super(params);
        this.cacheJson = {};
        this.cacheIpJson = {};
        this.cacheArr = [];
    }

    // 把redis消费数据经过加工之后同步到db3中 的定时任务（从redis中拉取数据）
    async saveWxReportDatasForRedis() {
        // 获得本地文件缓存
        try {
            const beginTime = new Date().getTime();
            const filepath = path.resolve(__dirname, `../../cache/${this.app.config.ip_city_cache_file.wx}`);
            const ipDatas = fs.readFileSync(filepath, { encoding: 'utf8' });
            const result = JSON.parse(`{${ipDatas.slice(0, -1)}}`);
            this.cacheIpJson = result;
            this.app.logger.info(`--------读取文件城市Ip地址耗时为 ${new Date().getTime() - beginTime}ms-------`);
        } catch (err) {
            this.cacheIpJson = {};
        }

        // 线程遍历
        const totalcount = await this.app.redis.llen('wx_repore_datas');
        let onecount = this.app.config.redis_consumption.thread_wx;
        if (onecount > totalcount) onecount = totalcount;

        for (let i = 0; i < onecount; i++) {
            if (i === onecount - 1) {
                this.getWebItemDataForRedis(true);
            } else {
                this.getWebItemDataForRedis();
            }
        }
    }

    // 单个item储存数据
    async getWebItemDataForRedis(type) {
        let query = await this.app.redis.rpop('wx_repore_datas');
        if (!query) return;
        query = JSON.parse(query);

        const item = {
            app_id: query.appId,
            create_time: new Date(query.time),
            errs: query.errs,
            ip: query.ip,
            mark_page: this.app.randomString(),
            mark_user: query.markuser,
            mark_uv: query.markuv,
            net: query.net,
            system: query.system,
            loc: query.loc,
            userInfo: query.userInfo,
            pages: query.pages,
            ajaxs: query.ajaxs,
        };

        let system = {};
        // 做一次appId缓存
        if (this.cacheJson[item.app_id]) {
            system = this.cacheJson[item.app_id];
        } else {
            system = await this.service.system.getSystemForAppId(item.app_id);
            this.cacheJson[item.app_id] = system;
        }
        if (system.is_use !== 0) return;
        if (system.is_statisi_system === 0) this.savePages(item);
        if (system.is_statisi_ajax === 0) this.saveAjaxs(item, system);
        if (system.is_statisi_error === 0) this.saveErrors(item);
        if (type) this.app.redis.set('wx_task_begin_time', item.create_time);
    }

    // 把db2的数据经过加工之后同步到db3中 的定时任务
    async saveWxReportDatasForMongodb() {
        let beginTime = await this.app.redis.get('wx_task_begin_time');
        const endTime = new Date();
        const query = { create_time: { $lt: endTime } };

        if (beginTime) {
            beginTime = new Date(new Date(beginTime).getTime() + 1000);
            query.create_time.$gt = beginTime;
        }

        /*
        * 请求db1数据库进行同步数据
        *  查询db1是否正常,不正常则重启
        */
        try {
            const datas = await this.ctx.model.Wx.WxReport.find(query)
                .read('sp')
                .sort({ create_time: 1 })
                .exec();
            this.app.logger.info(`-----------db1--查询wx端db1数据库是否可用----${datas.length}------`);

            // 储存数据
            this.commonSaveDatas(datas);
        } catch (err) {
            this.app.restartMongodbs('db1', this.ctx, err);
        }

    }

    // 储存数据到db3
    async commonSaveDatas(datas) {
        // 开启多线程执行
        this.cacheJson = {};
        this.cacheArr = [];
        if (datas && datas.length) {
            // 获得本地文件缓存
            try {
                const filepath = path.resolve(__dirname, `../../cache/${this.app.config.ip_city_cache_file.wx}`);
                const ipDatas = fs.readFileSync(filepath, { encoding: 'utf8' });
                const result = JSON.parse(`{${ipDatas.slice(0, -1)}}`);
                this.cacheIpJson = result;
            } catch (err) {
                this.cacheIpJson = {};
            }

            const length = datas.length;
            const number = Math.ceil(length / this.app.config.report_thread);

            for (let i = 0; i < this.app.config.report_thread; i++) {
                const newSpit = datas.splice(0, number);
                if (datas.length) {
                    this.saveDataToDb3(newSpit);
                } else {
                    this.saveDataToDb3(newSpit, true);
                }
            }
        }
    }

    // 存储数据
    async saveDataToDb3(data, type) {
        if (!data && !data.length) return;
        const length = data.length - 1;

        // 遍历数据
        data.forEach(async (item, index) => {
            let system = {};
            // 做一次appId缓存
            if (this.cacheJson[item.app_id]) {
                system = this.cacheJson[item.app_id];
            } else {
                system = await this.service.system.getSystemForAppId(item.app_id);
                this.cacheJson[item.app_id] = system;
            }
            if (system.is_use !== 0) return;
            if (system.is_statisi_system === 0) this.savePages(item);
            if (system.is_statisi_ajax === 0) this.saveAjaxs(item, system);
            if (system.is_statisi_error === 0) this.saveErrors(item);
            if (index === length && type) this.app.redis.set('wx_task_begin_time', item.create_time);
        });
    }

    // 储存网页性能数据
    async savePages(item) {
        const ip = item.ip;
        if (!ip) return;
        let copyip = ip.split('.');
        copyip = `${copyip[0]}.${copyip[1]}.${copyip[2]}`;
        let datas = null;
        if (this.cacheIpJson[copyip]) {
            datas = this.cacheIpJson[copyip];
        } else if (this.app.config.ip_redis_or_mongodb === 'redis') {
            // 通过reids获得用户IP对应的地理位置信息
            datas = await this.app.redis.get(copyip);
            if (datas) {
                datas = JSON.parse(datas);
                this.cacheIpJson[copyip] = datas;
                this.saveIpDatasInFile(copyip, { city: datas.city, province: datas.province });
            }
        } else if (this.app.config.ip_redis_or_mongodb === 'mongodb') {
            // 通过mongodb获得用户IP对应的地理位置信息
            datas = await this.ctx.model.IpLibrary.findOne({ ip: copyip }).read('sp').exec();
            if (datas) {
                this.cacheIpJson[copyip] = datas;
                this.saveIpDatasInFile(copyip, { city: datas.city, province: datas.province });
            }
        }

        const pages = this.app.models.WxPages(item.app_id)();
        pages.app_id = item.app_id;
        pages.create_time = item.create_time;
        pages.path = item.pages.router;
        pages.options = item.pages.options;
        pages.mark_page = item.mark_page;
        pages.mark_user = item.mark_user;
        pages.mark_uv = item.mark_uv;
        pages.net = item.net;
        pages.ip = item.ip;
        pages.brand = item.system.brand;
        pages.model = item.system.model;
        pages.screenWidth = item.system.screenWidth;
        pages.screenHeight = item.system.screenHeight;
        pages.language = item.system.language;
        pages.version = item.system.version;
        pages.system = item.system.system;
        pages.platform = item.system.platform;
        pages.SDKVersion = item.system.SDKVersion;
        if (datas) {
            pages.province = datas.province;
            pages.city = datas.city;
        }
        pages.save();
    }

    // 存储ajax信息
    saveAjaxs(data, system) {
        if (!data.ajaxs && !data.ajaxs.length) return;
        let slowAjaxTime = system.slow_ajax_time || 2;

        data.ajaxs.forEach(item => {
            const duration = parseInt(item.duration || 0);
            slowAjaxTime = slowAjaxTime * 1000;
            const speedType = duration >= slowAjaxTime ? 2 : 1;

            const ajaxs = this.app.models.WxAjaxs(data.app_id)();
            ajaxs.app_id = data.app_id;
            ajaxs.create_time = data.create_time;
            ajaxs.speed_type = speedType;
            ajaxs.name = item.name;
            ajaxs.method = item.method;
            ajaxs.duration = item.duration;
            ajaxs.body_size = item.bodySize;
            ajaxs.mark_page = data.mark_page;
            ajaxs.mark_user = data.mark_user;
            ajaxs.options = item.options;
            ajaxs.path = data.pages.router;
            ajaxs.save();
        });
    }

    // 存储错误信息
    saveErrors(data) {
        if (!data.errs && !data.errs.length) return;
        data.errs.forEach(item => {
            const errors = this.app.models.WxErrors(data.app_id)();
            errors.app_id = data.app_id;
            errors.name = item.name;
            errors.create_time = data.create_time;
            errors.msg = item.msg;
            errors.type = item.type;
            errors.status = item.status;
            errors.col = item.col;
            errors.line = item.line;
            errors.options = item.options;
            errors.method = item.method;
            errors.mark_page = data.mark_page;
            errors.mark_user = data.mark_user;
            errors.path = data.pages.router;
            errors.save();
        });
    }

    // 保存城市信息到文件中
    saveIpDatasInFile(copyip, json) {
        if (this.cacheArr.includes(copyip)) return;
        this.cacheArr.push(copyip);
        const filepath = path.resolve(__dirname, `../../cache/${this.app.config.ip_city_cache_file.wx}`);
        const str = `"${copyip}":${JSON.stringify(json)},`;
        fs.appendFile(filepath, str, { encoding: 'utf8' }, () => { });
    }

}

module.exports = WxReportTaskService;
