'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const ErrorsSchema = new Schema({
        dbname: { type: String }, // 重启的db name
        is_success: { type: String }, // 是否重启成功
        shell: { type: String }, // 重启的sell脚本地址
        restart_error: { type: String }, // 重启的error信息
        catch_error: { type: String }, // db检测错误信息
        create_time: { type: Date, default: Date.now }, // 错误创建时间
    });

    return conn.model('Errors', ErrorsSchema);
};
