'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const WebPagesSchema = new Schema({
        app_id: { type: String }, // 所属系统id
        create_time: { type: Date, default: Date.now }, // 访问时间
        url: { type: String }, // url域名
        full_url: { type: String }, // 完整域名
        pre_url: { type: String }, // 用户访问的上一个页面，本页面来源
        speed_type: { type: Number }, // 访问速度类型 1：正常  2：慢
        mark_page: { type: String }, // 所有资源页面统一标识 html img css js 用户系统信息等
        mark_user: { type: String }, // 统一某一时间段用户标识
        load_time: { type: Number }, // 页面完全加载时间 单位：ms
        dns_time: { type: Number }, // dns解析时间 单位：ms
        tcp_time: { type: Number }, // TCP连接时间
        dom_time: { type: Number }, // DOM构建时间 单位：ms
        resource_list: { type: Array }, // 资源性能数据列表
        white_time: { type: Number }, // 白屏时间 单位：ms
        redirect_time: { type: Number }, // 页面重定向时间
        unload_time: { type: Number }, // unload 时间
        request_time: { type: Number }, // request请求耗时
        analysisDom_time: { type: Number }, // 解析dom耗时
        ready_time: { type: Number }, // 页面准备时间
        screenwidth: { type: Number }, // 屏幕宽度
        screenheight: { type: Number }, // 屏幕高度
    });

    WebPagesSchema.index({ speed_type: 1, app_id: 1, url: 1, create_time: -1 });
    WebPagesSchema.index({ app_id: 1, create_time: -1 });

    app.models.WebPages = function(appId) {
        return conn.model(`web_pages_${appId}`, WebPagesSchema);
    };

    return conn.model('WebPages', WebPagesSchema);
};
