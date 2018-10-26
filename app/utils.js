'use strict';
// 一天
const pvs = {};
const uvs = {};
const ips = {};
// 每分钟
let pvsmin = {};
let uvsmin = {};
let ipsmin = {};
let timer = null;

const setPvUvIpCom = (appId, markUv, markIp, compvs, comuvs, comips) => {
    // pv
    if (compvs[appId]) {
        compvs[appId] = compvs[appId] + 1;
    } else {
        compvs[appId] = 1;
    }
    // uv
    if (comuvs[appId]) {
        comuvs[appId].add(markUv);
    } else {
        comuvs[appId] = new Set([ markUv ]);
    }
    // ip
    if (comips[appId]) {
        comips[appId].add(markIp);
    } else {
        comips[appId] = new Set([ markIp ]);
    }
};
const setPvUvIp = (appId, markUv, markIp) => {
    // 每天
    setPvUvIpCom(appId, markUv, markIp, pvs, uvs, ips);
    // 每分
    setPvUvIpCom(appId, markUv, markIp, pvsmin, uvsmin, ipsmin);
};

const getPvUvIp = (appId, type = 1) => {
    if (type === 1) {
        return {
            pv: pvs[appId] || 0,
            uv: uvs[appId] ? uvs[appId].size : 0,
            ip: ips[appId] ? ips[appId].size : 0,
        };
    }
};

const getPvUvIpMinute = endTime => {

    clearTimeout(timer);
    const json = {
        pv: pvsmin,
        uv: uvsmin,
        ip: ipsmin,
        end_time: endTime,
    };
    timer = setTimeout(() => {
        pvsmin = clearObject(pvsmin);
        uvsmin = clearObject(uvsmin);
        ipsmin = clearObject(ipsmin);
        clearTimeout(timer);
    }, 2000);
    return json;
};
// 情况json值
function clearObject(obj) {
    if (!obj) return {};
    for (const key in obj) {
        obj[key] = '';
    }
    return obj;
}
module.exports = {
    setPvUvIpForAppId: setPvUvIp,
    getPvUvIpForAppId: getPvUvIp,
    getPvUvIpForMinute: getPvUvIpMinute,
};
