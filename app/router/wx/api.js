'use strict';

module.exports = app => {
    const apiV1Router = app.router.namespace('/api/v1/');
    const { controller, middleware } = app;
    const {
        report,
    } = controller.api.wx;

    // 校验用户是否登录中间件
    const tokenRequired = middleware.tokenRequired();

    // 微信小程序数据上报
    apiV1Router.post('report/wx', report.wxReport);

};
