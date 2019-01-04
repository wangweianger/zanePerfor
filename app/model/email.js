'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const EmailSchema = new Schema({
        email: { type: String }, // 用户名称
        name: { type: String }, // 用户名
        system_ids: { type: Array }, // 用户所拥有的应用信息
        create_time: { type: Date, default: Date.now }, // 用户访问时间
    });

    EmailSchema.index({ email: -1 });

    return conn.model('Email', EmailSchema);
};
