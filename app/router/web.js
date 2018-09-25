'use strict';

module.exports = app => {
    const { router, controller } = app;
    const { home } = controller.web;

    // 首页渲染
    router.get('/', home.index);
};
