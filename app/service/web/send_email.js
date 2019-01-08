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

        if (toplist.provinces && toplist.provinces.length) {
            for (let i = 0, len = toplist.provinces.length; i < len; i++) {
                provincehtml += `<div class="item">${toplist.provinces[i]._id.province}：<span class="main_color">${toplist.provinces[i].count}</span></div>`;
            }
        }
        if (toplist.toppages && toplist.toppages.length) {
            for (let i = 0, len = toplist.toppages.length; i < len; i++) {
                toppageshtml += `<tr>
                    <td>${i + 1}、${toplist.toppages[i]._id.url}</td>
                    <td class="main_color">${toplist.toppages[i].count}</td>
                </tr>`;
            }
        }
        if (toplist.topjumpout && toplist.topjumpout.length) {
            for (let i = 0, len = toplist.topjumpout.length; i < len; i++) {
                topjumpout += `<tr>
                    <td>${i + 1}、${toplist.topjumpout[i]._id.value}</td>
                    <td class="main_color">${toplist.topjumpout[i].count}</td>
                </tr>`;
            }
        }
        return `<html>
            <style>*{margin:0;padding:0;}
            body{background:#f4f4f4;}
            h1{font-size:20px;text-align:center;line-height:60px;}
            h2{font-size:18px;line-height:50px;}
            .mt20{margin-top:20px!important;}
            .block{width:90%;margin:0 auto;background:#fff;border-radius:6px;padding:20px;overflow:hidden;}
            .block .item{display: inline-block;margin-right:20px;font-size:18px;padding:0 20px;}
            .w-50{width:50%;float:left;}
            .table{width:100%;}
            table.table tr{border:solid 1px #eee;border-collapse:collapse;}
            table.table tr th{font-size:13px;height:40px;font-weight:300;padding:8px;}
            table.table tr:nth-child(odd) {background: #f7f9ff;}
            table.table tr td{font-size:13px;border:solid 1px #eee;padding:8px;}
            .main_color{color:#8776f7;}
            </style>
            <body>
                <div class="main">
                    <h1>${systemMsg.system_name}应用${datas.day}详情</h1>
                    <div class="block">
                        <h2>PV/UV/IP统计</h2>
                        <div>
                            <div class="item">PV：<span class="main_color">${pvuvip.pv || 0}</span></div>
                            <div class="item">UV：<span class="main_color">${pvuvip.uv || 0}</span></div>
                            <div class="item">IP：<span class="main_color">${pvuvip.ip || 0}</span></div>
                            <div class="item">跳出率：<span class="main_color">${pvuvip.bounce || 0}</span></div>
                            <div class="item">访问深度：<span class="main_color">${pvuvip.depth || 0}</span></div>
                        </div>
                    </div>
                    <div class="block mt20">
                        <h2>省市流量排行</h2>
                        <div>
                            ` + provincehtml + `
                        </div>
                    </div>
                    <div class="block mt20">
                        <div class="w-100">
                            <h2>TOP10访问页面</h2>
                            <table class="table" cellspacing="0">
                                <tr>
                                    <th>页面地址</th>
                                    <th>访问量</th>
                                </tr>
                                ` + toppageshtml + `
                            </table>
                        </div>
                        <div class="w-100 mt20">
                            <h2>TOP10跳出率</h2>
                            <table class="table" cellspacing="0">
                                <tr>
                                    <th>页面地址</th>
                                    <th>访问量</th>
                                </tr>
                                ` + topjumpout + `
                            </table>
                        </div>
                    </div>
                </div>
            </body>
        </html>`;
    }
}

module.exports = SendEmailService;
