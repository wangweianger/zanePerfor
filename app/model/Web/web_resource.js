'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const Mixed = Schema.Types.Mixed;
    const conn = app.mongooseDB.get('db3');

    const WebResourceSchema = new Schema({
        app_id: { type: String }, // 所属系统
        create_time: { type: Date, default: Date.now }, // 用户访问时间
        url: { type: String }, // 访问页面的url
        full_url: { type: String }, // 完整的资源名称
        speed_type: { type: Number }, // 访问速度类型 1：正常  2：慢
        resource_datas: { type: Mixed }, // 页面所有加载资源json对象
        name: { type: String }, // 资源名称
        method: { type: String, default: 'GET' }, // 资源请求方式
        type: { type: String }, // 资源类型
        duration: { type: Number, default: 0 }, // 资源请求耗时
        decoded_body_size: { type: Number, default: 0 }, // 资源请求返回大小
        next_hop_protocol: { type: String, default: 'http/1.1' }, // 资源请求类型
        mark_page: { type: String }, // 所有资源页面统一标识 html img css js 用户系统信息等
        mark_user: { type: String }, // 统一某一时间段用户标识
    });

    WebResourceSchema.index({ speed_type: 1, name: 1, create_time: -1 });
    WebResourceSchema.index({ name: 1, create_time: -1 });
    WebResourceSchema.index({ speed_type: 1, url: 1 });

    app.models.WebResource = function(appId) {
        return conn.model(`web_resources_${appId}`, WebResourceSchema);
    };
};
