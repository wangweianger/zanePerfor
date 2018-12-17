'use strict';

module.exports = app => {
    const { router, controller } = app;
    const { web } = controller.web;

    // ------------------------------ 浏览器 -------------------------------
    // 首页pvuvip数据统计
    router.get('/web/home', web.webhome);

    // 用户访问轨迹
    router.get('/web/analysislist', web.analysislist);

    // 访问轨迹详情
    router.get('/web/analysisdetail', web.analysisdetail);

    // 访问页面平均性能
    router.get('/web/pagesavg', web.webpagesavg);

    // 单页面访问页面列表性能
    router.get('/web/pageslist', web.webpageslist);

    // 单个页面详情
    router.get('/web/pagesdetails', web.webpagedetails);

    // 单页面慢性能列表
    router.get('/web/slowpageslist', web.webslowpageslist);

    // ajax平均性能列表
    router.get('/web/ajaxavg', web.webajaxavg);

    // ajax详情列表
    router.get('/web/ajaxdetail', web.webajaxdetail);

    // ajax item详情信息
    router.get('/web/ajaxitemdetail', web.webajaxitemdetail);

    // 慢资源列表
    router.get('/web/resourcesavg', web.webresourceavg);

    // 慢资源详情
    router.get('/web/resourcesdetail', web.webresourcedetail);

    // 单个资源详情信息
    router.get('/web/resourcesitemdetail', web.webresourcesitemdetail);

    // 分类错误资源列表
    router.get('/web/erroravg', web.weberroravg);

    // 错误详情列表
    router.get('/web/errordetail', web.weberrordetail);

    // 错误item详情信息
    router.get('/web/erroritemdetail', web.weberroritemdetail);

    // web设置
    router.get('/web/setting', web.websetting);

    // web端新增系统
    router.get('/web/addsystem', web.webaddsystem);

    // top指标
    router.get('/web/top', web.webtop);

    // 城市热力图
    router.get('/web/diagram', web.webdiagram);

    // 告警
    router.get('/web/alarm', web.webalarm);

};
