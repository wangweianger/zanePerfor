'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const WebEnvironmentSchema = new Schema({
        app_id: { type: String }, // 所属系统
        create_time: { type: Date, default: Date.now }, // 用户访问时间
        url: { type: String }, // 访问页面的url
        mark_page: { type: String }, // 所有资源页面统一标识 html img css js 用户系统信息等
        mark_user: { type: String }, // 统一某一时间段用户标识
        mark_uv: { type: String }, // 统一uv标识
        browser: { type: String }, // 浏览器名称
        borwser_version: { type: String }, // 浏览器版本
        system: { type: String }, // 操作系统
        system_version: { type: String }, // 系统版本
        ip: { type: String }, // 访问者IP
        county: { type: String }, // 国家
        province: { type: String }, // 省
        city: { type: String }, // 市
    });
    WebEnvironmentSchema.index({ url: 1, create_time: -1 });
    WebEnvironmentSchema.index({ ip: 1, create_time: -1 });
    WebEnvironmentSchema.index({ create_time: -1 });
    WebEnvironmentSchema.index({ mark_page: 1 });
    WebEnvironmentSchema.index({ mark_user: 1 });

    app.models.WebEnvironment = function(appId) {
        return conn.model(`web_environment_${appId}`, WebEnvironmentSchema);
    };
};
