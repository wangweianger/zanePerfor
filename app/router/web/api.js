'use strict';

module.exports = app => {
    const apiV1Router = app.router.namespace('/api/v1/');
    const { controller, middleware } = app;
    const {
        report,
        pvuvip,
        pages,
        environment,
        ajax,
        resource,
        error,
        analysis,
    } = controller.api.web;

    // 校验用户是否登录中间件
    const tokenRequired = middleware.tokenRequired();

    // 浏览器用户数据上报
    apiV1Router.post('report/web', report.webReport);

    // ----------------pv uv ip---------------
    // 获得实时统计概况
    apiV1Router.get('pvuvip/getPvUvIpSurvey', tokenRequired, pvuvip.getPvUvIpSurvey);
    // 获得某日统计概况
    apiV1Router.get('pvuvip/getPvUvIpSurveyOne', tokenRequired, pvuvip.getPvUvIpSurveyOne);
    // 实时获取pv uv ip信息 （多条数据）
    apiV1Router.post('pvuvip/getPvUvIpList', tokenRequired, pvuvip.getPvUvIpList);
    // 实时获取pv uv ip信息 （单条数据）
    apiV1Router.post('pvuvip/getPvUvIpOne', tokenRequired, pvuvip.getPvUvIpOne);
    // 获得历史pvuvip统计列表
    apiV1Router.get('pvuvip/getHistoryPvUvIplist', tokenRequired, pvuvip.getHistoryPvUvIplist);

    // ----------------- 用户漏斗分析 ----------------
    // 用户行为轨迹列表
    apiV1Router.get('analysis/getAnalysislist', tokenRequired, analysis.getAnalysislist);
    // 单个用户行为轨迹列表
    apiV1Router.get('analysis/getAnalysisOneList', tokenRequired, analysis.getAnalysisOneList);
    // top list
    apiV1Router.get('analysis/getTopDatas', tokenRequired, analysis.getTopDatas);
    // 省总访问量排行
    apiV1Router.get('analysis/getProvinceAvgCount', tokenRequired, analysis.getProvinceAvgCount);

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

};
