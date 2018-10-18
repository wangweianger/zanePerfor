'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const ipLibrarySchema = new Schema({
        ip: { type: String }, // ip
        country: { type: String }, // 国家
        province: { type: String }, // 省
        city: { type: String }, // 市
        latitude: { type: Number }, // 纬度
        longitude: { type: Number }, // 经度
    });

    ipLibrarySchema.index({ ip: -1 });

    return conn.model('IpLibrary', ipLibrarySchema);
};
