'use strict';

module.exports = app => {
    const apiV1Router = app.router.namespace('/api/v1/');
    const { controller } = app;
    const { report, system, pvuvip, pages, environment, ajax, resource } = controller.api;

    // ----------------浏览器端script脚本获取---------------
    apiV1Router.get('report/webscript', report.getWebScript);

    // 浏览器用户数据上报
    apiV1Router.post('report/web', report.webReport);

    // ----------------系统配置相关---------------
    // 新增系统
    apiV1Router.get('system/add', system.addNewSystem);
    // 修改系统
    apiV1Router.post('system/update', system.updateSystem);
    // 根据用户ID获得系统信息
    apiV1Router.get('system/getMsgForUserId', system.getSysForUserId);

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

    // ----------------用户系统位置ip等信息---------------
    // 获得用户系统、地址位置、浏览器分类
    apiV1Router.get('environment/getDataGroupBy', environment.getDataGroupBy);

    // -------------------ajax-----------------------------
    apiV1Router.get('ajax/getPageAjaxs', ajax.getPageAjaxs);

    // -------------------resource资源-----------------------------
    apiV1Router.get('resource/getResourceForType', resource.getResourceForType);


    // const apiV1Router = app.router.namespace('/api/v1');
    // const { controller, middleware } = app;
    // const { user, message, topic, reply, collect } = controller.api;
    // const tokenRequired = middleware.tokenRequired();
    // 用户
    // apiV1Router.get('/user/:loginname', user.show);
    // apiV1Router.post('/accesstoken', tokenRequired, user.verify);

};
