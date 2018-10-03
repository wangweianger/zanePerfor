'use strict';

module.exports = app => {
    const apiV1Router = app.router.namespace('/api/v1/');
    const { controller } = app;
    const { report, system } = controller.api;

    // 浏览器用户数据上报
    apiV1Router.post('report/web', report.webReport);

    // ----------------系统配置相关---------------
    // 新增系统
    apiV1Router.get('system/add', system.addNewSystem);
    // 修改系统
    apiV1Router.post('system/update', system.updateSystem);


    // const apiV1Router = app.router.namespace('/api/v1');
    // const { controller, middleware } = app;
    // const { user, message, topic, reply, collect } = controller.api;
    // const tokenRequired = middleware.tokenRequired();
    // 用户
    // apiV1Router.get('/user/:loginname', user.show);
    // apiV1Router.post('/accesstoken', tokenRequired, user.verify);

};
