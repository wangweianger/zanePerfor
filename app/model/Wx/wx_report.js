'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const Mixed = Schema.Types.Mixed;
    const conn = app.mongooseDB.get('db1');
    if (!conn) return;

    const WxReportSchema = new Schema({
        app_id: { type: String }, // 系统标识
        create_time: { type: Date, default: Date.now }, // 创建时间
        errs: { type: Array }, // 用户浏览器信息标识
        ip: { type: String }, // 用户ip
        mark_page: { type: String }, // 所有资源页面统一标识 html img css js 用户系统信息等
        mark_user: { type: String }, // 统一某一时间段用户标识
        mark_uv: { type: String }, // 统一uv标识
        net: { type: String }, // 网络类型
        system: { type: Mixed }, // 用户手机信息
        loc: { type: Mixed }, // 用户地理位置信息
        userInfo: { type: Mixed }, // 用户信息
        pages: { type: Mixed }, // 小程序path路径信息
        ajaxs: { type: Array }, // 当前path页面ajax相关信息
        type: { type: Number }, // 1:网页级别上报  2：后续操作ajax|error上报
    });
    WxReportSchema.index({ create_time: 1 });

    return conn.model('WxReport', WxReportSchema);
};
