'use strict';
const Service = require('egg').Service;

class ErrorsService extends Service {

    // 获得列表信息
    async getErrorList(pageNos, pageSize) {
        pageNos = pageNos * 1;
        pageSize = pageSize * 1;


        const count = Promise.resolve(this.ctx.model.Errors.count({}).exec());
        const datas = Promise.resolve(
            this.ctx.model.Errors.find({}).skip((pageNos - 1) * pageSize)
                .limit(pageSize)
                .exec()
        );
        const all = await Promise.all([ count, datas ]);

        return {
            datalist: all[1],
            totalNum: all[0],
            pageNo: pageNos,
        };
    }

    // 保存db和服务重启错误信息
    async saveSysAndDbErrors(type, item, catcherr, error) {
        const errors = this.ctx.model.Errors();
        errors.dbname = type;
        errors.is_success = error ? '失败' : '成功';
        errors.shell = item;
        errors.restart_error = error;
        errors.catch_error = catcherr;
        errors.create_time = new Date();
        errors.save();
    }

}

module.exports = ErrorsService;
