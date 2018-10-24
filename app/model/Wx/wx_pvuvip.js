'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const WxPvUvIpSchema = new Schema({
        app_id: { type: String }, // 所属系统ID
        pv: { type: Number }, // PV统计
        uv: { type: Number }, // uv统计
        ip: { type: Number }, // ip统计
        type: { type: Number, default: 1 }, // 1:每分钟数据  2：每小时数据
        create_time: { type: Date, default: Date.now },
    });

    WxPvUvIpSchema.index({ app_id: -1, create_time: 1 });

    return conn.model('WxPvUvIp', WxPvUvIpSchema);
};
