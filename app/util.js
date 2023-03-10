'use strict';

const getUserIp = ctx => {
    const res = ctx.req.headers['x-forwarded-for'] ||
        ctx.req.headers['x-real-ip'] ||
        ctx.req.headers.remote_addr ||
        ctx.req.headers.client_ip ||
        ctx.req.connection.remoteAddress ||
        ctx.req.socket.remoteAddress ||
        ctx.req.connection.socket.remoteAddress ||
        ctx.ip;
    return res.match(/[.\d\w]+/g).join('');
};


module.exports = {
    getUserIp,
};
