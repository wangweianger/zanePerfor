'use strict';
const Service = require('egg').Service;

class SendEmailService extends Service {

    constructor(params) {
        super(params);
        this.daliy = {};
    }

    // 收集每日日报数据
    async getDaliyDatas(data, type) {
        const config = this.app.config.email.client;
        if (!((config.host && config.port && typeof (config.secure) === 'boolean') || config.service) || !config.auth) return;
        if (!data.appId) return;

        if (!this.daliy[data.appId]) this.daliy[data.appId] = { pvuvip: null, toplist: null };
        this.daliy[data.appId][type] = data;

        if (this.daliy[data.appId].pvuvip && this.daliy[data.appId].toplist) {
            this.sendDaliyEmail();
        }
    }

    // 发送每日日报
    async sendDaliyEmail() {
        for (const key in this.daliy) {
            this.sendDaliyEmailBySystem(key, this.daliy[key]);
            this.daliy[key] = null;
        }
    }

    // 根据系统ID发送邮件
    async sendDaliyEmailBySystem(appId, datas = {}) {
        const systemMsg = await this.ctx.service.system.getSystemForAppId(appId);
        if (systemMsg.is_use !== 0 && systemMsg.is_daily_use !== 0) return;
        const from = systemMsg.system_name + '应用日报';
        const to = systemMsg.daliy_list.toString();
        const timestrap = new Date().getTime() - 86300000;
        const day = this.app.format(new Date(timestrap), 'yyyy/MM/dd') + '日日报';

        datas.systemMsg = systemMsg;
        datas.day = day;

        const mailOptions = {
            from: `${from}<${this.app.config.email.client.auth.user}>`,
            to,
            subject: day,
            html: await this.daliyHtmlTem(datas),
        };
        this.app.email.sendMail(mailOptions);
    }

    // 每日日邮件模板
    async daliyHtmlTem(datas) {
        const pvuvip = datas.pvuvip || {};
        const toplist = datas.toplist || {};
        const systemMsg = datas.systemMsg || {};

        let provincehtml = '';
        let toppageshtml = '';
        let topjumpout = '';
        let topbrowser = '';

        if (toplist.provinces && toplist.provinces.length) {
            for (let i = 0, len = toplist.provinces.length; i < len; i++) {
                provincehtml += `<div style="display:inline-block;margin-right:20px;margin-bottom:20px;">${toplist.provinces[i]._id.province}：<span style="color:#8776f7;">${toplist.provinces[i].count}</span></div>`;
            }
        }
        if (toplist.topbrowser && toplist.topbrowser.length) {
            for (let i = 0, len = toplist.topbrowser.length; i < len; i++) {
                topbrowser += `<div style="display:inline-block;margin-right:20px;margin-bottom:20px;">${toplist.topbrowser[i]._id.browser}：<span style="color:#8776f7;">${toplist.topbrowser[i].count}</span></div>`;
            }
        }
        if (toplist.toppages && toplist.toppages.length) {
            for (let i = 0, len = toplist.toppages.length; i < len; i++) {
                toppageshtml += `<tr style="border:solid 1px #eee;border-collapse:collapse;">
                    <td style="font-size:13px;border:solid 1px #eee;padding:8px;">${i + 1}、${toplist.toppages[i]._id.url}</td>
                    <td style="color:#8776f7;font-size:13px;border:solid 1px #eee;padding:8px;">${toplist.toppages[i].count}</td>
                </tr>`;
            }
        }
        if (toplist.topjumpout && toplist.topjumpout.length) {
            for (let i = 0, len = toplist.topjumpout.length; i < len; i++) {
                topjumpout += `<tr style="border:solid 1px #eee;border-collapse:collapse;">
                    <td style="font-size:13px;border:solid 1px #eee;padding:8px;">${i + 1}、${toplist.topjumpout[i]._id.value}</td>
                    <td style="color:#8776f7;font-size:13px;border:solid 1px #eee;padding:8px;">${toplist.topjumpout[i].count}</td>
                </tr>`;
            }
        }
        return `<html style="margin:0;padding:0;">
            <style>*{margin:0;padding:0;}
            .block .item{}
            table.table tr:nth-child(odd) {background: #f7f9ff;}
            </style>
            <body style="background:#f4f4f4;">
                <div>
                    <h1 style="font-size:20px;text-align:center;line-height:60px;">${systemMsg.system_name}应用${datas.day}详情</h1>
                    <div style="width:90%;margin:0 auto;background:#fff;border-radius:6px;padding:20px;overflow:hidden;">
                        <h2 style="font-size:18px;line-height:50px;">PV/UV/IP/AJAX统计</h2>
                        <div>
                            <div style="display: inline-block;margin-right:20px;font-size:18px;padding:0 20px;">PV：<span style="color:#8776f7;">${pvuvip.pv || 0}</span></div>
                            <div style="display: inline-block;margin-right:20px;font-size:18px;padding:0 20px;">UV：<span style="color:#8776f7;">${pvuvip.uv || 0}</span></div>
                            <div style="display: inline-block;margin-right:20px;font-size:18px;padding:0 20px;">IP：<span style="color:#8776f7;">${pvuvip.ip || 0}</span></div>
                            <div style="display: inline-block;margin-right:20px;font-size:18px;padding:0 20px;">AJAX：<span style="color:#8776f7;">${pvuvip.ajax || 0}</span></div>
                            <div style="display: inline-block;margin-right:20px;font-size:18px;padding:0 20px;">跳出率：<span style="color:#8776f7;">${pvuvip.bounce || 0}</span></div>
                            <div style="display: inline-block;margin-right:20px;font-size:18px;padding:0 20px;">访问深度：<span style="color:#8776f7;">${pvuvip.depth || 0}</span></div>
                            <div style="display: inline-block;margin-right:20px;font-size:18px;padding:0 20px;">流量：<span style="color:#8776f7;">${this.app.flow(pvuvip.flow)}</span></div>
                        </div>
                    </div>
                    <div style="width:90%;margin:0 auto;margin-top:20px;background:#fff;border-radius:6px;padding:20px;overflow:hidden;">
                        <h2 style="font-size:18px;line-height:50px;">省市流量排行</h2>
                        <div>
                            ` + provincehtml + `
                        </div>
                    </div>
                    <div style="width:90%;margin:0 auto;margin-top:20px;background:#fff;border-radius:6px;padding:20px;overflow:hidden;">
                        <h2 style="font-size:18px;line-height:50px;">省市流量排行</h2>
                        <div>
                            ` + topbrowser + `
                        </div>
                    </div>
                    <div style="width:90%;margin:0 auto;margin-top:20px;background:#fff;border-radius:6px;padding:20px;overflow:hidden;">
                        <h2 style="font-size:18px;line-height:50px;">TOP10访问页面</h2>
                        <table cellspacing="0" style="width:100%;">
                            <tr style="border:solid 1px #eee;border-collapse:collapse;">
                                <th style="font-size:13px;height:40px;font-weight:300;padding:8px;">页面地址</th>
                                <th style="font-size:13px;height:40px;font-weight:300;padding:8px;">访问量</th>
                            </tr>
                            ` + toppageshtml + `
                        </table>
                    </div>
                    <div style="width:90%;margin:0 auto;margin-top:20px;background:#fff;border-radius:6px;padding:20px;overflow:hidden;">
                        <h2 style="font-size:18px;line-height:50px;">TOP10跳出率</h2>
                        <table cellspacing="0" style="width:100%;">
                            <tr style="border:solid 1px #eee;border-collapse:collapse;">
                                <th style="font-size:13px;height:40px;font-weight:300;padding:8px;">页面地址</th>
                                <th style="font-size:13px;height:40px;font-weight:300;padding:8px;">访问量</th>
                            ` + topjumpout + `
                        </table>
                    </div>
                </div>
            </body>
        </html>`;
    }
}

module.exports = SendEmailService;
