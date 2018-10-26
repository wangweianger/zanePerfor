'use strict';
const parser = require('cron-parser');
const Service = require('egg').Service;

// 一天
let pvs = {};
let uvs = {};
let ips = {};
// 每分钟
let pvsmin = {};
let uvsmin = {};
let ipsmin = {};
let timer = null;
let isreload = 0;

class WebReportService extends Service {
    // 每分钟统计
    async getWebPvUvIpBy() {
        // 检测服务器是否重启参数
        const interval = parser.parseExpression(this.app.config.pvuvip_task_minute_time);
        interval.prev();
        const endTime = new Date(interval.prev().toString());
        // 检测是否重启
        if (isreload === 0) {
            let result = await this.app.redis.get('web_pv_uv_ip_pre_day');
            if (result) {
                result = JSON.parse(result);
                if (result.pv) pvs = result.pv;
                if (result.uv) uvs = result.uv;
                if (result.ip) ips = result.ip;
            }
        }
        isreload = isreload <= 100 ? isreload + 1 : 100;
        // 保存每分钟数据
        this.getPvUvIpClass(endTime, pvsmin, uvsmin, ipsmin, 1);
        // 检测是否是凌晨0点
        const timestr = this.app.format(endTime, 'hh:mm:ss');
        if (timestr === '00:00:00') {
            // 保存每天数据
            await this.getPvUvIpClass(endTime, pvs, uvs, ips, 2);
            pvs = {}; uvs = {}; ips = {};
            this.app.redis.set('web_pv_uv_ip_pre_day', '');
        }
    }
    // 遍历
    async getPvUvIpClass(endTime, pv, uv, ip, type) {
        // 获得当前每分钟的pv uv ip 数据
        const result = await this.getPvUvIpMinute(endTime, pv, uv, ip);
        console.log(result)
        if (result && result.pv && result.uv && result.ip) {
            Object.keys(result.pv).forEach(item => {
                const pv = result.pv[item] || 0;
                const uv = result.uv[item] ? result.uv[item].length : 0;
                const ip = result.ip[item] ? result.ip[item].length : 0;
                this.savePvUvIpData(item, pv, uv, ip, endTime, type);
            });
        }
    }

    // 保存每分钟数据到数据库
    async savePvUvIpData(appId, pv, uv, ip, endTime, type) {
        const pvuvip = this.ctx.model.Web.WebPvuvip();
        pvuvip.app_id = appId;
        pvuvip.pv = pv || 0;
        pvuvip.uv = uv || 0;
        pvuvip.ip = ip || 0;
        pvuvip.create_time = endTime;
        pvuvip.type = type;
        await pvuvip.save();
    }
    setPvUvIpCom(appId, markUv, markIp, compvs, comuvs, comips) {
        // pv
        if (compvs[appId]) {
            compvs[appId] = compvs[appId] + 1;
        } else {
            compvs[appId] = 1;
        }
        // uv
        if (comuvs[appId] && !comuvs[appId].includes(markUv)) {
            comuvs[appId].push(markUv);
        } else {
            comuvs[appId] = [ markUv ];
        }
        // ip
        if (comips[appId] && !comips[appId].includes(markIp)) {
            comips[appId].push(markIp);
        } else {
            comips[appId] = [ markIp ];
        }
    }
    setPvUvIp(appId, markUv, markIp) {
        // 每天
        this.setPvUvIpCom(appId, markUv, markIp, pvs, uvs, ips);
        // 每分
        this.setPvUvIpCom(appId, markUv, markIp, pvsmin, uvsmin, ipsmin);
    }
    getPvUvIp(appId, type = 1) {
        if (type === 1) {
            return {
                pv: pvs[appId] || 0,
                uv: uvs[appId] ? uvs[appId].length : 0,
                ip: ips[appId] ? ips[appId].length : 0,
            };
        }
    }
    getPvUvIpMinute(endTime, copypv, copyuv, copyip) {
        const pvuvip = {
            pv: pvs,
            uv: uvs,
            ip: ips,
        };
        this.app.redis.set('web_pv_uv_ip_pre_day', JSON.stringify(pvuvip));
        clearTimeout(timer);
        timer = setTimeout(() => {
            pvsmin = this.clearObject(copypv);
            uvsmin = this.clearObject(copyuv);
            ipsmin = this.clearObject(copyip);
            clearTimeout(timer);
        }, 2000);
        return {
            pv: copypv,
            uv: copyuv,
            ip: copyip,
            end_time: endTime,
        };
    }
    clearObject(obj) {
        if (!obj) return {};
        for (const key in obj) {
            obj[key] = '';
        }
        return obj;
    }
}

module.exports = WebReportService;
