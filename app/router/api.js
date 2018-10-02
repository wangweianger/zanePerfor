'use strict';

module.exports = app => {
    const apiV1Router = app.router.namespace('/api/v1/');
    const { controller } = app;
    const { report } = controller.api;

    // 浏览器用户数据上报
    apiV1Router.post('report/web', report.webReport);


    // const apiV1Router = app.router.namespace('/api/v1');
    // const { controller, middleware } = app;
    // const { user, message, topic, reply, collect } = controller.api;
    // const tokenRequired = middleware.tokenRequired();
    // 用户
    // apiV1Router.get('/user/:loginname', user.show);
    // apiV1Router.post('/accesstoken', tokenRequired, user.verify);

};
