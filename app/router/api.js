'use strict';

module.exports = app => {
    const apiV1Router = app.router.namespace('/api/v1/');
    const { controller } = app;
    const { report, system, pvuvip, pages, environment, ajax, resource, error } = controller.api;

    // ----------------浏览器端script脚本获取---------------
    apiV1Router.get('report/webscript', report.getWebScript);

    // 浏览器用户数据上报
    apiV1Router.post('report/web', report.webReport);

    // ----------------系统配置相关---------------
    // 新增系统
    apiV1Router.post('system/add', system.addNewSystem);
    // 修改系统
    apiV1Router.post('system/update', system.updateSystem);
    // 根据用户ID获得系统信息
    apiV1Router.get('system/getMsgForUserId', system.getSysForUserId);
    // 根据系统ID获得单个系统信息
    apiV1Router.get('system/getSystemForId', system.getSystemForId);

    // ----------------pv uv ip---------------
    // 获得实时统计概况
    apiV1Router.get('pvuvip/getPvUvIpSurvey', pvuvip.getPvUvIpSurvey);
    // 获得某日统计概况
    apiV1Router.get('pvuvip/getPvUvIpSurveyOne', pvuvip.getPvUvIpSurveyOne);
    // 实时获取pv uv ip信息 （多条数据）
    apiV1Router.post('pvuvip/getPvUvIpList', pvuvip.getPvUvIpList);
    // 实时获取pv uv ip信息 （单条数据）
    apiV1Router.post('pvuvip/getPvUvIpOne', pvuvip.getPvUvIpOne);

    // ----------------页面性能分析---------------
    // 平均列表
    apiV1Router.get('pages/getAveragePageList', pages.getAveragePageList);
    // 单个页面性能列表
    apiV1Router.get('pages/getOnePageList', pages.getOnePageList);
    // 单个页面性能列表（简单版本）
    apiV1Router.get('pages/getPagesForType', pages.getPagesForType);
    // 单个页面详情
    apiV1Router.get('pages/getPageDetails', pages.getPageDetails);

    // ----------------用户系统位置ip等信息---------------
    // 获得用户系统、地址位置、浏览器分类
    apiV1Router.get('environment/getDataGroupBy', environment.getDataGroupBy);
    // 根据mark_page获得用户系统信息
    apiV1Router.get('environment/getEnvironmentForPage', environment.getEnvironmentForPage);

    // -------------------ajax-----------------------------
    // 根据url获得ajax信息
    apiV1Router.get('ajax/getPageAjaxsAvg', ajax.getPageAjaxsAvg);
    // 获得ajax平均性能列表
    apiV1Router.get('ajax/getAverageAjaxList', ajax.getAverageAjaxList);
    // 获得单个api的平均性能数据
    apiV1Router.get('ajax/getOneAjaxAvg', ajax.getOneAjaxAvg);
    // 获得单个api的性能列表数据
    apiV1Router.get('ajax/getOneAjaxList', ajax.getOneAjaxList);

    // -------------------resource资源-----------------------------
    // 根据资源类型获得数据
    apiV1Router.get('resource/getResourceForType', resource.getResourceForType);
    // 获得resource平均性能列表
    apiV1Router.get('resource/getAverageResourceList', resource.getAverageResourceList);
    // 获得单个resource的平均性能数据
    apiV1Router.get('resource/getOneResourceAvg', resource.getOneResourceAvg);
    // 获得单个resource的性能列表数据
    apiV1Router.get('resource/getOneResourceList', resource.getOneResourceList);

    // -------------------resource资源-----------------------------
    // 获得错误分类信息
    apiV1Router.get('error/getAverageErrorList', error.getAverageErrorList);
    // 获得单个错误详情列表
    apiV1Router.get('error/getOneErrorList', error.getOneErrorList);
    // 单个错误详情
    apiV1Router.get('error/getErrorDetail', error.getErrorDetail);

    // const apiV1Router = app.router.namespace('/api/v1');
    // const { controller, middleware } = app;
    // const { user, message, topic, reply, collect } = controller.api;
    // const tokenRequired = middleware.tokenRequired();
    // 用户
    // apiV1Router.get('/user/:loginname', user.show);
    // apiV1Router.post('/accesstoken', tokenRequired, user.verify);

};
