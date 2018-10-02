'use strict';

const url = require('url');
const querystring = require('querystring');
const UAParser = require('ua-parser-js');

const Service = require('egg').Service;

class DataTimedTaskService extends Service {

    // 把db2的数据经过加工之后同步到db3中 的定时任务
    async saveWebReportDatas() {
        const beginTime = await this.app.redis.get('web_task_begin_time');
        const endTime = new Date();
        beginTime ? await this.app.redis.set('web_task_begin_time', endTime) :
            await this.app.redis.set('web_task_begin_time', new Date());

        const datas = await this.ctx.model.Web.WebReport.where('create_time')
            .gt(beginTime)
            .lt(endTime)
            .exec();
        this.saveDataToDb3(datas);
    }

    // 存储数据
    saveDataToDb3(data) {
        if (!data && !data.length) return;

        // 遍历数据
        data.forEach(item => {
            this.savePages(item);
            this.forEachResources(item);
            this.saveErrors(item);
            this.saveEnvironment(item);
        });
    }

    // 储存网页性能数据
    savePages(item) {
        const pages = this.ctx.model.Web.WebPages();
        const performance = item.performance;

        pages.app_id = item.app_id;
        pages.create_time = item.create_time;
        pages.url = item.url;
        pages.pre_url = item.pre_url;
        pages.speed_type = 1;
        pages.mark_page = item.mark_page;
        pages.mark_user = item.mark_user;
        pages.load_time = performance.lodt;
        pages.dns_time = performance.dnst;
        pages.tcp_time = performance.tcpt;
        pages.dom_time = performance.domt;
        // pages.resource_time = performance.domt;
        pages.white_time = performance.wit;
        pages.redirect_time = performance.rdit;
        pages.unload_time = performance.uodt;
        pages.request_time = performance.reqt;
        pages.analysisDom_time = performance.domt;
        pages.ready_time = performance.radt;
        pages.screenwidth = item.screenwidth;
        pages.screenheight = item.screenheight;

        pages.save();
    }

    // 根据资源类型存储不同数据
    forEachResources(data) {
        if (!data.resource_list && !data.resource_list.length) return;

        // 遍历所有资源进行存储
        data.resource_list.forEach(item => {
            if (item.type === 'xmlhttprequest') {
                this.saveAjaxs(data, item);
            } else {
                this.saveResours(data, item);
            }
        });
    }

    // 存储ajax信息
    saveAjaxs(data, item) {
        const newurl = url.parse(item.name);
        const newName = newurl.protocol + '//' + newurl.host + newurl.pathname;
        const querydata = newurl.query ? JSON.stringify(querystring.parse(newurl.query)) : '{}';

        const ajaxs = this.ctx.model.Web.WebAjaxs();
        ajaxs.app_id = data.app_id;
        ajaxs.create_time = data.create_time;
        ajaxs.speed_type = 1;
        ajaxs.url = newName;
        ajaxs.method = item.method;
        ajaxs.duration = item.duration;
        ajaxs.decoded_body_size = item.decodedBodySize;
        ajaxs.call_url = data.url;
        ajaxs.mark_page = data.mark_page;
        ajaxs.mark_user = data.mark_user;
        ajaxs.query_datas = querydata;

        ajaxs.save();
    }

    // 储存网页资源性能数据
    saveResours(data, item) {
        const resours = this.ctx.model.Web.WebResource();
        resours.app_id = data.app_id;
        resours.create_time = data.create_time;
        resours.url = data.url;
        resours.speed_type = 1;
        resours.resource_datas = JSON.stringify(item);
        resours.mark_page = data.mark_page;
        resours.mark_user = data.mark_user;

        resours.save();
    }

    // 存储错误信息
    saveErrors(data) {
        if (!data.error_list && !data.error_list.length) return;
        data.error_list.forEach(item => {
            const newurl = url.parse(item.data.resourceUrl||'');
            const newName = newurl.protocol + '//' + newurl.host + newurl.pathname;
            const querydata = newurl.query ? JSON.stringify(querystring.parse(newurl.query)) : '{}';

            const errors = this.ctx.model.Web.WebErrors();
            errors.app_id = data.app_id;
            errors.url = data.url;
            errors.create_time = data.create_time;
            errors.msg = item.msg;
            errors.category = item.n;
            errors.resource_url = newName;
            errors.target = item.data.target;
            errors.type = item.data.type;
            errors.status = item.data.status;
            errors.text = item.data.text;
            errors.col = item.data.col;
            errors.line = item.data.line;
            errors.querydata = querydata;
            errors.method = item.method;
            errors.fullurl = item.data.resourceUrl;

            errors.save();
        });
    }

    //  储存用户的设备信息
    saveEnvironment(data) {
        // 检测用户UA相关信息
        const parser = new UAParser();
        parser.setUA(data.user_agent);
        const result = parser.getResult();

        const environment = this.ctx.model.Web.WebEnvironment();
        environment.app_id = data.app_id;
        environment.create_time = data.create_time;
        environment.url = data.url;
        environment.mark_page = data.mark_page;
        environment.mark_user = data.mark_user;
        environment.browser = result.browser.name || '';
        environment.borwser_version = result.browser.version || '';
        environment.system = result.os.name || '';
        environment.system_version = result.os.version || '';
        environment.ip = data.ip;
        environment.county = data.county;
        environment.province = data.province;

        environment.save();

    }
}

module.exports = DataTimedTaskService;
