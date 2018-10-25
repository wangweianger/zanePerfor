'use strict';

const Service = require('egg').Service;
let timer = null;
class WxReportTaskService extends Service {

    // 把db2的数据经过加工之后同步到db3中 的定时任务
    async saveWxReportDatas() {
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
        let db1data = false;
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (db1data) {
                db1data = false; clearTimeout(timer);
            } else {
                this.app.restartMongodbs('db1'); clearTimeout(timer);
            }
        }, 10000);
        const datas = await this.ctx.model.Wx.WxReport.find(query)
            .sort({ create_time: 1 })
            .exec();
        db1data = true;
        this.app.logger.info('-----------db1--查询wx端db1数据库是否可用----------');
        this.app.logger.info(datas.length);

        // 开启多线程执行
        if (datas && datas.length) {
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
        const cacheJson = {};
        // 遍历数据
        data.forEach(async (item, index) => {
            let system = {};
            // 做一次appId缓存
            if (cacheJson[item.app_id]) {
                system = cacheJson[item.app_id];
            } else {
                system = await this.service.system.getSystemForAppId(item.app_id);
                cacheJson[item.app_id] = system;
            }
            if (system.is_use !== 0) return;
            if (system.is_statisi_system === 0) this.savePages(item);
            if (system.is_statisi_ajax === 0) this.saveAjaxs(item, system);
            if (system.is_statisi_error === 0) this.saveErrors(item);
            if (index === length && type) this.app.redis.set('wx_task_begin_time', item.create_time);
        });
    }

    // 储存网页性能数据
    savePages(item) {
        const pages = this.ctx.model.Wx.WxPages();
        pages.app_id = item.app_id;
        pages.create_time = item.create_time;
        pages.path = item.pages.router;
        pages.options = item.pages.options;
        pages.mark_page = item.mark_page;
        pages.mark_user = item.mark_user;
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

            const ajaxs = this.ctx.model.Wx.WxAjaxs();
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
            const errors = this.ctx.model.Wx.WxErrors();
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

}

module.exports = WxReportTaskService;
