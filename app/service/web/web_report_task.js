'use strict';

const url = require('url');
const querystring = require('querystring');
const UAParser = require('ua-parser-js');

const Service = require('egg').Service;

class DataTimedTaskService extends Service {

    // 把db2的数据经过加工之后同步到db3中 的定时任务
    async saveWebReportDatas() {
        let beginTime = await this.app.redis.get('web_task_begin_time');
        const endTime = new Date();
        const query = { create_time: { $lt: endTime } };

        if (beginTime) {
            beginTime = new Date(new Date(beginTime).getTime() + 1000);
            query.create_time.$gt = beginTime;
        }

        const datas = await this.ctx.model.Web.WebReport.find(query)
            .sort({ create_time: 1 })
            .exec();
        this.saveDataToDb3(datas);
    }

    // 存储数据
    async saveDataToDb3(data) {
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
                system = await this.service.web.webSystem.getSystemForAppId(item.app_id);
                cacheJson[item.app_id] = system;
            }
            if (system.is_use !== 0) return;
            if (system.is_statisi_pages === 0) this.savePages(item, system.slow_page_time);
            if (system.is_statisi_resource === 0 || system.is_statisi_ajax === 0) this.forEachResources(item, system);
            if (system.is_statisi_error === 0) this.saveErrors(item);
            if (system.is_statisi_system === 0) this.saveEnvironment(item);
            if (index === length) this.app.redis.set('web_task_begin_time', item.create_time);
        });
    }

    // 储存网页性能数据
    savePages(item, slowPageTime = 5) {
        const pages = this.ctx.model.Web.WebPages();
        const performance = item.performance;

        const newurl = url.parse(item.url);
        const newName = newurl.protocol + '//' + newurl.host + newurl.pathname;

        slowPageTime = slowPageTime * 1000;
        const speedType = performance.lodt >= slowPageTime ? 2 : 1;

        pages.app_id = item.app_id;
        pages.create_time = item.create_time;
        pages.url = newName;
        pages.full_url = item.url;
        pages.pre_url = item.pre_url;
        pages.speed_type = speedType;
        pages.mark_page = item.mark_page;
        pages.mark_user = item.mark_user;
        pages.load_time = performance.lodt;
        pages.dns_time = performance.dnst;
        pages.tcp_time = performance.tcpt;
        pages.dom_time = performance.domt;
        pages.resource_list = item.resource_list;
        pages.white_time = performance.wit;
        pages.redirect_time = performance.rdit;
        pages.unload_time = performance.uodt;
        pages.request_time = performance.reqt;
        pages.analysisDom_time = performance.andt;
        pages.ready_time = performance.radt;
        pages.screenwidth = item.screenwidth;
        pages.screenheight = item.screenheight;

        pages.save();
    }

    // 根据资源类型存储不同数据
    forEachResources(data, system) {
        if (!data.resource_list && !data.resource_list.length) return;

        // 遍历所有资源进行存储
        data.resource_list.forEach(item => {
            if (item.type === 'xmlhttprequest') {
                if (system.is_statisi_ajax === 0) this.saveAjaxs(data, item, system.slow_ajax_time);
            } else {
                if (system.is_statisi_resource === 0) this.saveResours(data, item, system);
            }
        });
    }

    // 存储ajax信息
    saveAjaxs(data, item, slowAjaxTime = 2) {
        const newurl = url.parse(item.name);
        const newName = newurl.protocol + '//' + newurl.host + newurl.pathname;
        const querydata = newurl.query ? JSON.stringify(querystring.parse(newurl.query)) : '{}';

        const duration = parseInt(item.duration || 0);
        slowAjaxTime = slowAjaxTime * 1000;
        const speedType = duration >= slowAjaxTime ? 2 : 1;

        const ajaxs = this.ctx.model.Web.WebAjaxs();
        ajaxs.app_id = data.app_id;
        ajaxs.create_time = data.create_time;
        ajaxs.speed_type = speedType;
        ajaxs.url = newName;
        ajaxs.full_url = item.name;
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
    saveResours(data, item, system) {
        let slowTime = 2;
        let speedType = 1;
        const duration = parseInt(item.duration || 0);

        if (item.type === 'link' || item.type === 'css') {
            slowTime = (system.slow_css_time || 2) * 1000;
        } else if (item.type === 'script') {
            slowTime = (system.slow_js_time || 2) * 1000;
        } else if (item.type === 'img') {
            slowTime = (system.slow_img_time || 2) * 1000;
        } else {
            slowTime = 2 * 1000;
        }

        speedType = duration >= slowTime ? 2 : 1;
        // 因为相关性能远远 这里只存储慢资源
        if (duration < slowTime) return;

        const newurl = url.parse(item.name);
        const newName = newurl.protocol + '//' + newurl.host + newurl.pathname;

        const resours = this.ctx.model.Web.WebResource();
        resours.app_id = data.app_id;
        resours.create_time = data.create_time;
        resours.url = data.url;
        resours.full_url = item.name;
        resours.speed_type = speedType;
        resours.name = newName;
        resours.method = item.method;
        resours.type = item.type;
        resours.duration = item.duration;
        resours.decoded_body_size = item.decodedBodySize;
        resours.next_hop_protocol = item.nextHopProtocol;
        resours.mark_page = data.mark_page;
        resours.mark_user = data.mark_user;

        resours.save();
    }

    // 存储错误信息
    saveErrors(data) {
        if (!data.error_list && !data.error_list.length) return;
        data.error_list.forEach(item => {
            const newurl = url.parse(item.data.resourceUrl || '');
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
            errors.mark_page = data.mark_page;
            errors.mark_user = data.mark_user;

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
