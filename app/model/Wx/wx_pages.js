'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const Mixed = Schema.Types.Mixed;
    const conn = app.mongooseDB.get('db3');

    const WxPagesSchema = new Schema({
        app_id: { type: String }, // 系统标识
        create_time: { type: Date, default: Date.now }, // 创建时间
        path: { type: String }, // 当前路径
        options: { type: Mixed }, // 路径参数
        mark_page: { type: String }, // 所有资源页面统一标识
        mark_user: { type: String }, // 统一某一时间段用户标识
        mark_uv: { type: String }, // 统一uv标识
        net: { type: String }, // 网络类型
        ip: { type: String }, // 用户ip
        county: { type: String }, // 国家
        province: { type: String }, // 省
        city: { type: String }, // 市
        brand: { type: String }, // 手机品牌
        model: { type: String }, // 手机型号
        screenWidth: { type: String }, // 屏幕宽度
        screenHeight: { type: String }, // 屏幕高度
        language: { type: String }, // 微信设置的语言
        version: { type: String }, // 微信版本号
        system: { type: String }, // 操作系统版本
        platform: { type: String }, // 客户端平台
        SDKVersion: { type: String }, // 客户端基础库版本
    });

    WxPagesSchema.index({ path: 1, create_time: -1 });
    WxPagesSchema.index({ create_time: -1 });
    WxPagesSchema.index({ mark_page: -1 });
    WxPagesSchema.index({ mark_user: -1 });

    app.models.WxPages = function(appId) {
        return conn.model(`wx_pages_${appId}`, WxPagesSchema);
    };
};
