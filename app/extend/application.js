'use strict';

const md5 = require('md5');

module.exports = {
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
    // 返回备注
    returnText(str) {
        return `
            --------------------------------------------------------------------------------------------------------------------
            --------------------------------------------------------------------------------------------------------------------
            --------------------------------------------------------------------------------------------------------------------
            --------------------------------------------------------------------------------------------------------------------
            --------------------------------------------------${str}---------------------------------------------
            --------------------------------------------------------------------------------------------------------------------
            --------------------------------------------------------------------------------------------------------------------
            --------------------------------------------------------------------------------------------------------------------
            --------------------------------------------------------------------------------------------------------------------
        `;
    },
};

