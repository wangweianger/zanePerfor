'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const Mixed = Schema.Types.Mixed;
    const conn = app.mongooseDB.get('db3');

    const WxErrorsSchema = new Schema({
        app_id: { type: String }, // 系统标识
        create_time: { type: Date, default: Date.now }, // 创建时间
        mark_page: { type: String }, // 所有资源页面统一标识
        mark_user: { type: String }, // 统一某一时间段用户标识
        col: { type: Number }, // 错误行
        line: { type: Number }, // 错误列
        name: { type: String }, // 错误资源名称
        msg: { type: String }, // 错误信息
        type: { type: String }, // 错误类型
        method: { type: String }, // ajax请求方式
        status: { type: String }, // ajax请求返回状态
        options: { type: Mixed }, // ajax请求参数
        path: { type: String }, // 所属path路径
    });

    WxErrorsSchema.index({ type: 1, name: 1, create_time: 1 });
    WxErrorsSchema.index({ type: 1, path: 1, create_time: 1 });
    WxErrorsSchema.index({ name: 1, create_time: -1 });

    app.models.WxErrors = function(appId) {
        return conn.model(`wx_errors_${appId}`, WxErrorsSchema);
    };
};
