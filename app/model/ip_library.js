'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const ipLibrarySchema = new Schema({
        ip: { type: String }, // ip
        country: { type: String }, // 国家
        region: { type: String }, // 省
        city: { type: String }, // 市
        region_id: { type: Number }, // 省编号
        city_id: { type: Number }, // 市编号
    });

    ipLibrarySchema.index({ ip: -1, region: -1, city: -1, isp: -1 });

    return conn.model('IpLibrary', ipLibrarySchema);
};
