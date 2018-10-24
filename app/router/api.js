'use strict';

module.exports = app => {
    const apiV1Router = app.router.namespace('/api/v1/');
    const { controller, middleware } = app;
    const {
        user,
        remove,
        system,
    } = controller.api;

    // 校验用户是否登录中间件
    const tokenRequired = middleware.tokenRequired();

    // -----------------用户相关------------------
    // 用户登录
    apiV1Router.post('user/login', user.login);
    // 用户注册
    apiV1Router.post('user/register', user.register);
    // 退出登录
    apiV1Router.get('user/logout', tokenRequired, user.logout);
    // 获得用户列表
    apiV1Router.post('user/getUserList', tokenRequired, user.getUserList);
    // 冻结解冻用户
    apiV1Router.post('user/setIsUse', tokenRequired, user.setIsUse);
    // 删除用户
    apiV1Router.post('user/delete', tokenRequired, user.delete);

    // ----------------系统配置相关---------------
    // 新增系统
    apiV1Router.post('system/add', tokenRequired, system.addNewSystem);
    // 修改系统
    apiV1Router.post('system/update', tokenRequired, system.updateSystem);
    // 根据用户ID获得系统信息
    apiV1Router.get('system/getSysForUserId', tokenRequired, system.getSysForUserId);
    // 根据系统ID获得单个系统信息
    apiV1Router.get('system/getSystemForId', tokenRequired, system.getSystemForId);
    // 获得系统列表
    apiV1Router.get('system/web/list', tokenRequired, system.getWebSystemList);
    // 删除系统中某个用户
    apiV1Router.post('system/deleteUser', tokenRequired, system.deleteWebSystemUser);
    // 新增系统中某个用户
    apiV1Router.post('system/addUser', tokenRequired, system.addWebSystemUser);
    // 删除某个系统
    apiV1Router.post('system/deleteSystem', tokenRequired, system.deleteSystem);

    // -------------------清空数据-----------------------------
    // 清空db1 1日之前无用数据
    apiV1Router.post('remove/deleteDb1WebData', tokenRequired, remove.deleteDb1WebData);
    // 清空db2 number日之前所有性能数据
    apiV1Router.post('remove/deleteDb2WebData', tokenRequired, remove.deleteDb2WebData);

};
