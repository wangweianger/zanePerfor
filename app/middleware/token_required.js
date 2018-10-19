'use strict';
// 校验用户是否登录

module.exports = () => {
    return async function(ctx, next) {
        const usertoken = ctx.cookies.get('usertoken') || '';
        console.log(usertoken)
        if (!usertoken) {
            ctx.body = {
                code: 1004,
                desc: '用户未登录',
            };
            return;
        }
        const data = await ctx.service.user.finUserForToken(usertoken);
        if (!data || !data.user_name) {
            ctx.body = {
                code: 1004,
                desc: '登录用户无效！',
            };
            return;
        }
        await next();
    };
};
