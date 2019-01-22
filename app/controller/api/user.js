'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {

    // 用户登录
    async login() {
        const { ctx } = this;
        const query = ctx.request.body;
        const userName = query.userName;
        const passWord = query.passWord;

        if (!userName) throw new Error('用户登录：userName不能为空');
        if (!passWord) throw new Error('用户登录：passWord不能为空');

        const result = await ctx.service.user.login(userName, passWord);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 用户注册
    async register() {
        const { ctx } = this;
        const query = ctx.request.body;
        const userName = query.userName;
        const passWord = query.passWord;

        if (!userName) throw new Error('用户登录：userName不能为空');
        if (!passWord) throw new Error('用户登录：passWord不能为空');

        const result = await ctx.service.user.register(userName, passWord);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 退出登录
    async logout() {
        const { ctx } = this;
        const usertoken = ctx.cookies.get('usertoken', {
            encrypt: true,
            signed: true,
        }) || '';
        if (!usertoken) throw new Error('退出登录：token不能为空');

        await ctx.service.user.logout(usertoken);
        this.ctx.body = this.app.result({
            data: {},
        });
    }

    // 获得用户列表
    async getUserList() {
        const { ctx } = this;
        const query = ctx.request.body;
        const pageNo = query.pageNo;
        const pageSize = query.pageSize || this.app.config.pageSize;
        const userName = query.userName;

        const result = await ctx.service.user.getUserList(pageNo, pageSize, userName);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 冻结解冻用户
    async setIsUse() {
        const { ctx } = this;
        const query = ctx.request.body;
        const isUse = query.isUse || 0;
        const id = query.id || '';
        const usertoken = query.usertoken || '';

        if (!id) throw new Error('冻结解冻用户：id不能为空');

        const result = await ctx.service.user.setIsUse(id, isUse, usertoken);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // 删除用户
    async delete() {
        const { ctx } = this;
        const query = ctx.request.body;
        const id = query.id || '';
        const usertoken = query.usertoken || '';

        if (!id) throw new Error('删除用户：id不能为空');

        const result = await ctx.service.user.delete(id, usertoken);

        ctx.body = this.app.result({
            data: result,
        });
    }

    // github callback
    async githubLogin() {
        const { ctx } = this;
        try {
            const query_code = ctx.query.code;
            const tokenResult = await ctx.curl('https://github.com/login/oauth/access_token', {
                method: 'POST',
                contentType: 'json',
                data: {
                    client_id: this.app.config.github.client_id,
                    client_secret: this.app.config.github.client_secret,
                    code: query_code,
                },
                dataType: 'json',
                timeout: 8000,
            });
            if (tokenResult.status !== 200) {
                await ctx.render('github', {
                    data: {
                        title: 'github login',
                        data: JSON.stringify({ desc: tokenResult.data.error, type: 'github' }),
                    },
                });
                return;
            }

            const userResult = await ctx.curl(`https://api.github.com/user?access_token=${tokenResult.data.access_token}`, {
                dataType: 'json',
                timeout: 8000,
            });
            if (userResult.status !== 200) {
                await ctx.render('github', {
                    data: {
                        title: 'github login',
                        data: JSON.stringify({ desc: userResult.data.error, type: 'github' }),
                    },
                });
                return;
            }

            let result = {};
            if (!userResult.data.login || !userResult.data.node_id) {
                result.desc = 'github 权限验证失败, 请重试！';
            } else {
                result = await ctx.service.user.githubRegister(userResult.data.login, userResult.data.node_id);
            }
            result.type = 'github';
            await ctx.render('github', {
                data: {
                    title: 'github login',
                    data: JSON.stringify(result),
                },
            });
        } catch (err) {
            const result = { desc: 'github 权限验证失败, 请重试！', type: 'github' };
            if (err.toString().indexOf('timeout') > -1) {
                result.desc = 'github 接口请求超时,请重试！';
            }
            await ctx.render('github', {
                data: {
                    title: 'github login',
                    data: JSON.stringify(result),
                },
            });
        }
    }

    // 新浪微博登录
    async weiboLogin() {
        const { ctx } = this;
        try {
            const query_code = ctx.query.code;

            const getTokenPath = `https://api.weibo.com/oauth2/access_token?client_id=${this.app.config.weibo.client_id}&client_secret=${this.app.config.weibo.client_secret}&grant_type=authorization_code&code=${query_code}&redirect_uri=${this.app.config.origin}/api/v1/weibo/callback`;
            const tokenResult = await ctx.curl(getTokenPath, {
                method: 'POST',
                contentType: 'json',
                data: '',
                dataType: 'json',
                timeout: 8000,
            });
            if (tokenResult.status !== 200) {
                await ctx.render('github', {
                    data: {
                        title: 'weibo login',
                        data: JSON.stringify({ desc: tokenResult.data.error_description || '微博授权有误!', type: 'weibo' }),
                    },
                });
                return;
            }
            const getTokenInfo = await ctx.curl(`https://api.weibo.com/oauth2/get_token_info?access_token=${tokenResult.data.access_token}`, {
                method: 'POST',
                contentType: 'json',
                data: '',
                dataType: 'json',
                timeout: 8000,
            });
            if (getTokenInfo.status !== 200) {
                await ctx.render('github', {
                    data: {
                        title: 'weibo get access_token',
                        data: JSON.stringify({ desc: tokenResult.data.error_description || '微博获取access_token有误!', type: 'weibo' }),
                    },
                });
                return;
            }
            const getUserInfo = await ctx.curl(`https://api.weibo.com/2/users/show.json?access_token=${tokenResult.data.access_token}&uid=${getTokenInfo.data.uid}`, {
                dataType: 'json',
                timeout: 8000,
            });

            let result = {};
            if (!getUserInfo.data.name || !getUserInfo.data.idstr) {
                result.desc = '新浪微博权限验证失败, 请重试！';
            } else {
                result = await ctx.service.user.githubRegister(getUserInfo.data.name, getUserInfo.data.idstr);
            }
            result.type = 'weibo';
            await ctx.render('github', {
                data: {
                    title: 'weibo login',
                    data: JSON.stringify(result),
                },
            });

        } catch (err) {
            const result = { desc: '新浪微博授权失败,请重试！', type: 'weibo' };
            if (err.toString().indexOf('timeout') > -1) {
                result.desc = '新浪微博授权接口请求超时,请重试！';
            }
            await ctx.render('github', {
                data: {
                    title: 'weibo login',
                    data: JSON.stringify(result),
                },
            });
        }
    }

    // 微信登录
    async wechatLogin() {
        const { ctx } = this;
        try {
            const query_code = ctx.query.code;
            // get access_token
            const getTokenPath = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.app.config.wechat.client_id}&secret=${this.app.config.wechat.client_secret}&code=${query_code}&grant_type=authorization_code`;
            const tokenResult = await ctx.curl(getTokenPath, {
                method: 'POST',
                contentType: 'json',
                data: '',
                dataType: 'json',
                timeout: 8000,
            });
            if (tokenResult.status !== 200 && tokenResult.data.errcode) {
                await ctx.render('github', {
                    data: {
                        title: 'wechat login',
                        data: JSON.stringify({ desc: tokenResult.data.errmsg || '微信授权有误!', type: 'wechat' }),
                    },
                });
                return;
            }
            // get user msg
            const getUserMsg = await ctx.curl(`https://api.weixin.qq.com/sns/userinfo?access_token=${tokenResult.data.access_token}&openid=${tokenResult.data.openid}`, {
                method: 'POST',
                contentType: 'json',
                data: '',
                dataType: 'json',
                timeout: 8000,
            });
            if (getUserMsg.status !== 200 && getUserMsg.data.errcode) {
                await ctx.render('github', {
                    data: {
                        title: 'wechat login',
                        data: JSON.stringify({ desc: getUserMsg.data.errmsg || '微信授权有误!', type: 'wechat' }),
                    },
                });
                return;
            }
            // get result
            let result = {};
            if (!getUserMsg.data.nickname || !getUserMsg.data.openid) {
                result.desc = '微信登录权限验证失败, 请重试！';
            } else {
                result = await ctx.service.user.githubRegister(getUserMsg.data.nickname, getUserMsg.data.openid);
            }
            result.type = 'wechat';
            await ctx.render('github', {
                data: {
                    title: 'wechat login',
                    data: JSON.stringify(result),
                },
            });

        } catch (err) {
            const result = { desc: '微信登录授权失败,请重试！', type: 'wechat' };
            if (err.toString().indexOf('timeout') > -1) {
                result.desc = '微信登录授权接口请求超时,请重试！';
            }
            await ctx.render('github', {
                data: {
                    title: 'wechat login',
                    data: JSON.stringify(result),
                },
            });
        }
    }
}

module.exports = UserController;
