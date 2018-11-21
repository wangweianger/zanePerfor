'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const WebErrorsSchema = new Schema({
        app_id: { type: String }, // 所属系统
        url: { type: String }, // 访问页面的url
        create_time: { type: Date, default: Date.now }, // 用户访问时间
        msg: { type: String }, // 错误信息
        category: { type: String }, // 错误类型
        resource_url: { type: String }, // 错误资源URL
        target: { type: String }, // 资源类型
        type: { type: String }, // 错误类型
        status: { type: String }, // HTTP状态码
        text: { type: String }, // 资源错误提示
        col: { type: String }, // js错误列号
        line: { type: String }, // js错误行号
        querydata: { type: String }, // http请求参数
        method: { type: String }, // 资源请求方式
        fullurl: { type: String }, // 完整url
        mark_page: { type: String }, // 所有资源页面统一标识 html img css js 用户系统信息等
        mark_user: { type: String }, // 统一某一时间段用户标识
    });

    WebErrorsSchema.index({ category: 1, resource_url: 1, create_time: -1 });
    WebErrorsSchema.index({ resource_url: 1, create_time: -1 });
    WebErrorsSchema.index({ create_time: -1 });

    app.models.WebErrors = function(appId) {
        return conn.model(`web_errors_${appId}`, WebErrorsSchema);
    };
};
