'use strict';

module.exports = app => {
    const { router, controller } = app;
    const { home } = controller.web;

    // 应用列表
    router.get('/', home.systemlist);

    // 新增系统选择系统类型
    router.get('/selectype', home.selectype);

    // 用户登录
    router.get('/login', home.login);

    // 系统列表
    router.get('/systems', home.systems);

    // 用户管理
    router.get('/users', home.users);

    // 系统重启错误信息
    router.get('/errors', home.errors);

    // 邮件管理
    router.get('/emails', home.emails);

};
