'use strict';

const { exec } = require('child_process');
const md5 = require('md5');

module.exports = {
    // 生成model中间件
    middlewareModel(dbname, modelname) {
        const WebPagesSchema = this.WebReportSchema;
        const conn = this.mongooseDB.get(dbname);
        return conn.model(modelname, WebPagesSchema);
    },
    /* 生成随机字符串 */
    randomString(len) {
        len = len || 32;
        const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        const maxPos = $chars.length;
        let pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    },

    /* 本地加密算法 */
    signwx(json) {
        const wxkey = 'ZANEWANGWEI123456AGETEAMABmiliH';
        /* 对json的key值排序 */
        const arr = [];
        const sortJson = {};
        const newJson = json;
        for (const key in json) {
            if (json[key]) {
                arr.push(key);
            }
        }
        arr.sort((a, b) => {
            return a.localeCompare(b);
        });
        for (let i = 0, len = arr.length; i < len; i++) {
            sortJson[arr[i]] = json[arr[i]];
        }
        /* 拼接json为key=val形式 */
        let str = '';
        for (const key in sortJson) {
            str += key + '=' + sortJson[key] + '&';
        }
        str += 'key=' + wxkey;
        /* md5 */
        const md5Str = md5(str);
        const signstr = md5Str.toUpperCase();
        /* 获得有sign参数的json */
        newJson.paySign = signstr;
        return newJson;
    },
    // 返回结果json
    result(jn = {}) {
        return Object.assign({
            code: 1000,
            desc: '成功',
            data: '',
        }, jn);
    },
    format(date, fmt) {
        const o = {
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours(), // 小时
            'H+': date.getHours() > 12 ? date.getHours() - 12 : date.getHours(),
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds(), // 秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
        return fmt;
    },
    // 重启mongodb服务器
    restartMongodbs() {
        console.log(this.config.mongodb_restart_sh)
        if (!this.config.mongodb_restart_sh && !this.config.mongodb_restart_sh.length) return;
        this.config.mongodb_restart_sh.forEach(item => {
            exec(`sh ${item}`, error => {
                if (error) { console.log('重启mongodb数据库失败!'); return; }
                console.log('重启mongodb数据库成功!');
            });
        });
    },
};

