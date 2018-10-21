'use strict';

module.exports = app => {
    const apiV1Router = app.router.namespace('/api/v1/');
    const { controller, middleware } = app;
    const {
        user,
        remove,
    } = controller.api;
    const {
        report,
        system,
        pvuvip,
        pages,
        environment,
        ajax,
        resource,
        error,
    } = controller.api.web;

    // 校验用户是否登录中间件
    const tokenRequired = middleware.tokenRequired();

    // ----------------浏览器端script脚本获取---------------
    apiV1Router.get('report/webscript', report.getWebScript);

    // 浏览器用户数据上报
    apiV1Router.post('report/web', report.webReport);

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

    // ----------------pv uv ip---------------
    // 获得实时统计概况
    apiV1Router.get('pvuvip/getPvUvIpSurvey', tokenRequired, pvuvip.getPvUvIpSurvey);
    // 获得某日统计概况
    apiV1Router.get('pvuvip/getPvUvIpSurveyOne', tokenRequired, pvuvip.getPvUvIpSurveyOne);
    // 实时获取pv uv ip信息 （多条数据）
    apiV1Router.post('pvuvip/getPvUvIpList', tokenRequired, pvuvip.getPvUvIpList);
    // 实时获取pv uv ip信息 （单条数据）
    apiV1Router.post('pvuvip/getPvUvIpOne', tokenRequired, pvuvip.getPvUvIpOne);

    // ----------------页面性能分析---------------
    // 平均列表
    apiV1Router.get('pages/getAveragePageList', tokenRequired, pages.getAveragePageList);
    // 单个页面性能列表
    apiV1Router.get('pages/getOnePageList', tokenRequired, pages.getOnePageList);
    // 单个页面详情
    apiV1Router.get('pages/getPageDetails', tokenRequired, pages.getPageDetails);

    // ----------------用户系统位置ip等信息---------------
    // 获得用户系统、地址位置、浏览器分类
    apiV1Router.get('environment/getDataGroupBy', tokenRequired, environment.getDataGroupBy);
    // 根据mark_page获得用户系统信息
    apiV1Router.get('environment/getEnvironmentForPage', tokenRequired, environment.getEnvironmentForPage);

    // -------------------ajax-----------------------------
    // 根据url获得ajax信息
    apiV1Router.get('ajax/getPageAjaxsAvg', tokenRequired, ajax.getPageAjaxsAvg);
    // 获得ajax平均性能列表
    apiV1Router.get('ajax/getAverageAjaxList', tokenRequired, ajax.getAverageAjaxList);
    // 获得单个api的平均性能数据
    apiV1Router.get('ajax/getOneAjaxAvg', tokenRequired, ajax.getOneAjaxAvg);
    // 获得单个api的性能列表数据
    apiV1Router.get('ajax/getOneAjaxList', tokenRequired, ajax.getOneAjaxList);
    // 获得单个ajax详情
    apiV1Router.get('ajax/getOneAjaxDetail', tokenRequired, ajax.getOneAjaxDetail);

    // -------------------resource资源-----------------------------
    // 根据资源类型获得数据
    apiV1Router.get('resource/getResourceForType', tokenRequired, resource.getResourceForType);
    // 获得resource平均性能列表
    apiV1Router.get('resource/getAverageResourceList', tokenRequired, resource.getAverageResourceList);
    // 获得单个resource的平均性能数据
    apiV1Router.get('resource/getOneResourceAvg', tokenRequired, resource.getOneResourceAvg);
    // 获得单个resource的性能列表数据
    apiV1Router.get('resource/getOneResourceList', tokenRequired, resource.getOneResourceList);
    // 获得单个resource的性能详细信息
    apiV1Router.get('resource/getOneResourceDetail', tokenRequired, resource.getOneResourceDetail);

    // -------------------resource资源-----------------------------
    // 获得错误分类信息
    apiV1Router.get('error/getAverageErrorList', tokenRequired, error.getAverageErrorList);
    // 获得单个错误详情列表
    apiV1Router.get('error/getOneErrorList', tokenRequired, error.getOneErrorList);
    // 单个错误详情
    apiV1Router.get('error/getErrorDetail', tokenRequired, error.getErrorDetail);

    // -------------------清空数据-----------------------------
    // 清空db1 1日之前无用数据
    apiV1Router.post('remove/deleteDb1WebData', tokenRequired, remove.deleteDb1WebData);
    // 清空db2 number日之前所有性能数据
    apiV1Router.post('remove/deleteDb2WebData', tokenRequired, remove.deleteDb2WebData);

};
