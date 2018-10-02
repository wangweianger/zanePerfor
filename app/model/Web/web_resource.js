'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const WebResourceSchema = new Schema({
        app_id: { type: String }, // 所属系统
        create_time: { type: Date, default: Date.now }, // 用户访问时间
        url: { type: String }, // 访问页面的url
        speed_type: { type: Number }, // 访问速度类型 1：正常  2：慢
        resource_datas: { type: String }, // 页面所有加载资源json字符串
        mark_page: { type: String }, // 所有资源页面统一标识 html img css js 用户系统信息等
        mark_user: { type: String }, // 统一某一时间段用户标识
    });

    WebResourceSchema.index({ app_id: -1, create_time: 1, mark_page: -1, mark_user: -1, url: -1 });

    return conn.model('WebResource', WebResourceSchema);
};
