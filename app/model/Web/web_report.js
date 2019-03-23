'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const Mixed = Schema.Types.Mixed;
    const conn = app.mongooseDB.get('db1');
    if (!conn) return;

    const WebReportSchema = new Schema({
        app_id: { type: String }, // 系统标识
        create_time: { type: Date, default: Date.now }, // 创建时间
        user_agent: { type: String }, // 用户浏览器信息标识
        ip: { type: String }, // 用户ip
        mark_page: { type: String }, // 所有资源页面统一标识 html img css js 用户系统信息等
        mark_user: { type: String }, // 统一某一时间段用户标识
        mark_uv: { type: String }, // 统一uv标识
        url: { type: String }, // 访问url
        pre_url: { type: String }, // 上一页面来源
        performance: { type: Mixed }, // 用户浏览器性能数据
        error_list: { type: Mixed }, // 错误信息列表
        resource_list: { type: Mixed }, // 资源性能数据列表
        screenwidth: { type: Number }, // 屏幕宽度
        screenheight: { type: Number }, // 屏幕高度
        type: { type: Number }, // 1:网页性能上报  2：后续操作ajax上报 3：后续操作错误上报
    });
    WebReportSchema.index({ create_time: 1 });

    return conn.model('WebReport', WebReportSchema);
};
