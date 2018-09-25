'use strict';

const Service = require('egg').Service;

class PvuvipService extends Service {

    // 根据实际查询
    getPvUvIpByDataTime(dataTime) {
        const list = this.ctx.model.Pvuvip.count({
            data_time: dataTime,
        }).exec();
        console.log(list);
        return list;
    }
}

module.exports = PvuvipService;
