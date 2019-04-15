'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const WebResourceSchema = new Schema({
        system_domain: { type: String }, // 系统 域名
        system_name: { type: String }, // 系统名称
        app_id: { type: String }, // 系统appId标识
        type: { type: String, default: 'web' }, // 浏览器：web  微信小程序 ：wx
        user_id: { type: Array }, // 应用所属用户ID
        create_time: { type: Date, default: Date.now }, // 用户访问时间
        is_use: { type: Number, default: 0 }, // 是否需要统计  0：是  1：否
        slow_page_time: { type: Number, default: 5 }, // 页面加载页面阀值  单位：s
        slow_js_time: { type: Number, default: 2 }, // js慢资源阀值 单位：s
        slow_css_time: { type: Number, default: 2 }, // 慢加载css资源阀值  单位：S
        slow_img_time: { type: Number, default: 2 }, // 慢图片加载资源阀值  单位:S
        slow_ajax_time: { type: Number, default: 2 }, // AJAX加载阀值
        is_statisi_pages: { type: Number, default: 0 }, // 是否统计页面性能信息  0：是   1：否
        is_statisi_ajax: { type: Number, default: 0 }, // 是否统计页面Ajax性能资源 0：是  1：否
        is_statisi_resource: { type: Number, default: 0 }, // 是否统计页面加载资源性能信息 0：是    1：否
        is_statisi_system: { type: Number, default: 0 }, // 是否存储用户系统信息资源信息 0：是   1：否
        is_statisi_error: { type: Number, default: 0 }, // 是否上报页面错误信息  0：是   1：否
        is_daily_use: { type: Number, default: 0 }, // 是否发送日报  0：是  1：否
        daliy_list: { type: Array }, // 日报列表
        is_highest_use: { type: Number, default: 0 }, // 是否发送pv邮件  0：是  1：否
        highest_list: { type: Array }, // 突破历史pv峰值时发送邮件列表
    });

    WebResourceSchema.index({ app_id: -1, create_time: 1, system_domain: -1, user_id: -1 });

    return conn.model('System', WebResourceSchema);
};
