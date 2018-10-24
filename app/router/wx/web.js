'use strict';

module.exports = app => {
    const { router, controller } = app;
    const { wx } = controller.web;

    // ------------------------------ 微信小程序 -------------------------------

    // web端新增系统
    router.get('/wx/addsystem', wx.wxaddsystem);

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
};
