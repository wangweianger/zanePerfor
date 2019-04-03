'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const WxStatisSchema = new Schema({
        app_id: { type: String }, // 所属系统ID
        top_pages: { type: Array }, // top访问page列表
        top_jump_out: { type: Array }, // top访问跳出率页面列表
        top_brand: { type: Array }, // top手机品牌排行
        provinces: { type: Array }, // 省份访问流量排行
        create_time: { type: Date, default: Date.now },
    });

    WxStatisSchema.index({ app_id: 1, create_time: 1 });

    return conn.model('WxStatis', WxStatisSchema);
};
