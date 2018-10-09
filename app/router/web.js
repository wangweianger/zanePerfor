'use strict';

module.exports = app => {
    const { router, controller } = app;
    const { home } = controller.web;

    // 应用列表
    router.get('/', home.systemlist);

    // web浏览器端首页
    router.get('/web/home', home.webhome);
};
