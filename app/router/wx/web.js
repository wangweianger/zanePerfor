'use strict';

module.exports = app => {
    const { router, controller } = app;
    const { wx } = controller.web;

    // ------------------------------ 微信小程序 -------------------------------

    // web端新增系统
    router.get('/wx/addsystem', wx.wxaddsystem);

    // 用户访问轨迹
    router.get('/wx/analysislist', wx.analysislist);

    // 访问轨迹详情
    router.get('/wx/analysisdetail', wx.analysisdetail);

    // 小程序首页
    router.get('/wx/home', wx.wxhome);

    // 小程序设置页面
    router.get('/wx/setting', wx.wxsetting);

    // 访问页面平均性能
    router.get('/wx/pagesavg', wx.wxpagesavg);

    // 单页面访问页面列表性能
    router.get('/wx/pageslist', wx.wxpageslist);

    // 单个页面详情
    router.get('/wx/pagesdetails', wx.wxpagedetails);

    // ajax平均性能列表
    router.get('/wx/ajaxavg', wx.wxajaxavg);

    // ajax详情列表
    router.get('/wx/ajaxdetail', wx.wxajaxdetail);

    // ajax item详情信息
    router.get('/wx/ajaxitemdetail', wx.wxajaxitemdetail);

    // 分类错误资源列表
    router.get('/wx/erroravg', wx.wxerroravg);

    // 错误详情列表
    router.get('/wx/errordetail', wx.wxerrordetail);

    // 错误item详情信息
    router.get('/wx/erroritemdetail', wx.wxerroritemdetail);

    // top指标
    router.get('/wx/top', wx.wxtop);

    // 城市热力图
    router.get('/wx/diagram', wx.wxdiagram);
};
