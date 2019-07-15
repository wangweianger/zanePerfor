'use strict';
const { URL } = require('url');

// 校验用户是否登录
module.exports = () => {
    return async function(ctx, next) {
        const referer = ctx.request.header.referer || '';
        const url = new URL(referer);
        if (ctx.app.config.origin && ctx.app.config.origin.indexOf(url.origin) === -1) {
            ctx.body = {
                code: 1004,
                desc: '域名来源有误,请检查config的origin配置',
            };
            return;
        }
        const usertoken = ctx.cookies.get('usertoken', {
            encrypt: true,
            signed: true,
        }) || '';
        if (!usertoken) {
            ctx.body = {
                code: 1004,
                desc: '用户未登录,请重新登录',
            };
            return;
        }
        const data = await ctx.service.user.finUserForToken(usertoken);
        if (!data || !data.user_name) {
            ctx.cookies.set('usertoken', '');
            const descr = data && !data.user_name ? data.desc : '登录用户无效,请重新登录！';
            ctx.body = {
                code: 1004,
                desc: descr,
            };
            return;
        }
        await next();
    };
};
