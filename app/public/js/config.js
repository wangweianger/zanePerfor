
'use strict';

const config = {
    // 登陆页面
    loginUrl: '/login',

    // 登陆成功后需要跳转到的页面
    homeUrl: '/',

    // 根接口
    baseApi: '/',

    // ajax 请求超时时间
    ajaxtimeout: 15000,

    // 发送验证码时间间隔
    msgTime: 60,

    // 七牛图片根地址
    imgBaseUrl: 'http://ormfcl92t.bkt.clouddn.com/',

    // 隐藏显示时间
    containerShowTime: 10,

    // pagesize 分页数量
    pageSize: 50,
};

window.config = config; // eslint-disable-line
