'use strict';

module.exports = app => {
    const { router, controller } = app;
    const { home } = controller.web;

    // 应用列表
    router.get('/', home.systemlist);

    // ------------------------------浏览器-------------------------------
    // web浏览器端首页
    router.get('/web/home', home.webhome);

    // web浏览器访问页面
    router.get('/web/pages', home.webpages);

};
