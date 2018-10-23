'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const Mixed = Schema.Types.Mixed;
    const conn = app.mongooseDB.get('db3');

    const WxAjaxsSchema = new Schema({
        app_id: { type: String }, // 系统标识
        create_time: { type: Date, default: Date.now }, // 创建时间
        mark_page: { type: String }, // 所有资源页面统一标识
        mark_user: { type: String }, // 统一某一时间段用户标识
        duration: { type: String }, // 请求耗时
        name: { type: String }, // api路径
        method: { type: String }, // 请求方式
        bodySize: { type: String }, // 返回资源大小
        options: { type: Mixed }, // 请求参数
    });

    WxAjaxsSchema.index({ create_time: 1 });
    return conn.model('WxErrors', WxAjaxsSchema);
};
