'use strict';

const Service = require('egg').Service;
const fs = require('fs');
const path = require('path');
class IpTaskService extends Service {
    constructor(params) {
        super(params);
        this.cacheJson = {};
        this.cacheArr = [];
    }

    // 定时任务获得ip地理位置信息
    async saveWebGetIpDatas() {
        let beginTime = await this.app.redis.get('ip_task_begin_time');

        const query = { city: { $exists: false } };
        if (beginTime) {
            beginTime = new Date(new Date(beginTime).getTime() + 1000);
            query.create_time = { $gt: beginTime };
        }
        const datas = await this.ctx.model.Web.WebEnvironment.find(query)
            .read('sp')
            .limit(this.app.config.ip_thread * 60)
            .sort({ create_time: 1 })
            .exec();

        // 开启多线程执行
        this.cacheArr = [];
        if (datas && datas.length) {
            // 获得本地文件缓存
            try {
                const filepath = path.resolve(__dirname, `../../cache/${this.app.config.ip_city_cache_file.web}`);
                const ipDatas = fs.readFileSync(filepath, { encoding: 'utf8' });
                const result = JSON.parse(`{${ipDatas.slice(0, -1)}}`);
                this.cacheJson = result;
            } catch (err) {
                this.cacheJson = {};
            }

            for (let i = 0; i < this.app.config.ip_thread; i++) {
                const newSpit = datas.splice(0, 60);
                if (datas.length) {
                    this.handleDatas(newSpit);
                } else {
                    this.handleDatas(newSpit, true);
                }
            }
        }
    }

    // 遍历数据 查询ip地址信息
    async handleDatas(data, type) {
        if (!data && !data.length) return;
        const length = data.length - 1;
        let i = 0;
        const timer = setInterval(() => {
            if (data[i] && data[i].ip) {
                const ip = data[i].ip;
                this.getIpData(ip, data[i]._id);
                if (i === length && type) {
                    this.app.redis.set('ip_task_begin_time', data[i].create_time);
                    clearInterval(timer);
                }
                i++;
            }
        }, 1000);
    }

    // 根据ip获得地址信息 先查找数据库 再使用百度地图查询
    async getIpData(ip, _id) {
        let copyip = ip.split('.');
        copyip = `${copyip[0]}.${copyip[1]}.${copyip[2]}`;
        let datas = null;
        if (this.cacheJson[copyip]) {
            datas = this.cacheJson[copyip];
        } else if (this.app.config.ip_redis_or_mongodb === 'redis') {
            // 通过reids获得用户IP对应的地理位置信息
            datas = await this.app.redis.get(copyip);
            if (datas) {
                datas = JSON.parse(datas);
                this.cacheJson[copyip] = datas;
            }
        } else if (this.app.config.ip_redis_or_mongodb === 'mongodb') {
            // 通过mongodb获得用户IP对应的地理位置信息
            datas = await this.ctx.model.IpLibrary.findOne({ ip: copyip }).read('sp').exec();
            if (datas) this.cacheJson[copyip] = datas;
        }
        let result = null;
        if (datas) {
            // 直接更新
            result = await this.updateWebEnvironment(datas, _id);
        } else {
            // 查询百度地图地址信息并更新
            result = await this.getIpDataForBaiduApi(ip, _id, copyip);
        }
        return result;
    }

    // g根据百度地图api获得地址信息
    async getIpDataForBaiduApi(ip, _id, copyip) {
        if (!ip || ip === '127.0.0.1') return;
        const url = `https://api.map.baidu.com/location/ip?ip=${ip}&ak=${this.app.config.BAIDUAK}&coor=bd09ll`;
        const result = await this.app.curl(url, {
            dataType: 'json',
        });
        if (result.data.status === 0 && result.data.content) {
            const json = {
                _ip: ip,
                province: result.data.content.address_detail.province,
                city: result.data.content.address_detail.city,
            };
            if (!this.cacheArr.includes(copyip)) {
                this.cacheArr.push(copyip);
                // 保存到地址库
                this.saveIpDatasToDb(json, copyip);
                // 更新redis
                this.app.redis.set(copyip, JSON.stringify(json));
                // 更新程序缓存
                this.cacheJson[copyip] = json;
            }
            // 更新用户地址信息
            return await this.updateWebEnvironment(json, _id);
        }
    }

    // 存储ip地址库信息到DB
    async saveIpDatasToDb(data, copyip) {
        const iplibrary = this.ctx.model.IpLibrary();

        iplibrary.ip = copyip;
        iplibrary.province = data.province;
        iplibrary.city = data.city;
        iplibrary.latitude = data.latitude;
        iplibrary.longitude = data.longitude;
        return await iplibrary.save();
    }
    // 更新IP相关信息
    async updateWebEnvironment(data, id) {
        const update = {
            province: data.province,
            city: data.city,
        };
        const result = await this.ctx.model.Web.WebEnvironment.findByIdAndUpdate(id, update).exec();
        return result;
    }
}

module.exports = IpTaskService;
