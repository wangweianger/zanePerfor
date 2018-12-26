'use strict';

const Service = require('egg').Service;

class UserService extends Service {

    // 用户登录
    async login(userName, passWord) {
        // 检测用户是否存在
        const userInfo = await this.getUserInfoForUserName(userName);
        if (!userInfo.token) throw new Error('用户名不存在！');
        if (userInfo.pass_word !== passWord) throw new Error('用户密码不正确！');
        if (userInfo.is_use !== 0) throw new Error('用户被冻结不能登录，请联系管理员！');

        // 设置redis登录态
        const random_key = this.app.randomString();
        this.app.redis.set(`${random_key}_user_login`, JSON.stringify(userInfo), 'EX', this.app.config.user_login_timeout);
        // 设置登录cookie
        this.ctx.cookies.set('usertoken', random_key, {
            maxAge: this.app.config.user_login_timeout * 1000,
            httpOnly: true,
            encrypt: true,
            signed: true,
        });
        // 更新用户信息
        await this.updateUserToken({ username: userName, usertoken: random_key });

        return userInfo;
    }

    // 登出
    logout(usertoken) {
        this.ctx.cookies.set('usertoken', '');
        this.app.redis.set(`${usertoken}_user_login`, '');
        return {};
    }

    // 用户注册
    async register(userName, passWord) {
        // 检测用户是否存在
        const userInfo = await this.getUserInfoForUserName(userName);
        if (userInfo.token) throw new Error('用户注册：用户已存在！');

        // 新增用户
        const token = this.app.randomString();

        const user = this.ctx.model.User();
        user.user_name = userName;
        user.pass_word = passWord;
        user.token = token;
        user.create_time = new Date();
        user.level = userName === 'admin' ? 0 : 1;
        user.usertoken = token;
        const result = await user.save();

        // 设置redis登录态
        this.app.redis.set(`${token}_user_login`, JSON.stringify(result), 'EX', this.app.config.user_login_timeout);
        // 设置登录cookie
        this.ctx.cookies.set('usertoken', token, {
            maxAge: this.app.config.user_login_timeout * 1000,
            httpOnly: true,
            encrypt: true,
            signed: true,
        });

        return result;
    }

    // 根据用户名称查询用户信息
    async getUserInfoForUserName(userName) {
        return await this.ctx.model.User.findOne({ user_name: userName }).exec() || {};
    }

    // 查询用户列表信息（分页）
    async getUserList(pageNos, pageSize, userName) {
        pageNos = pageNos * 1;
        pageSize = pageSize * 1;

        const query = {};
        if (userName) query.user_name = userName;

        const count = Promise.resolve(this.ctx.model.User.count(query).exec());
        const datas = Promise.resolve(
            this.ctx.model.User.find(query).skip((pageNos - 1) * pageSize)
                .limit(pageSize)
                .exec()
        );
        const all = await Promise.all([ count, datas ]);

        return {
            datalist: all[1],
            totalNum: all[0],
            pageNo: pageNos,
        };
    }

    // 通过redis登录key获取用户信息
    async getUserInfoForUsertoken(usertoken) {
        return this.app.redis.get(`${usertoken}_user_login`) || {};
    }

    // 通过 token 获得 usertoken
    async getUserInfoForToken(_token) {
        return await this.ctx.model.User.findOne({ token: _token }).exec() || {};
    }

    // 冻结解冻用户
    async setIsUse(_token, isUse) {
        // 冻结用户信息
        isUse = isUse * 1;
        const result = await this.ctx.model.User.update(
            { token: _token },
            { is_use: isUse },
            { multi: true }
        ).exec();
        // 通过usertoken获得用户信息
        const userInfo = await this.getUserInfoForToken(_token);
        const userInfoToken = userInfo.usertoken;
        // 清空登录态
        if (userInfoToken) this.app.redis.set(`${userInfoToken}_user_login`, '');
        return result;
    }

    // 删除用户
    async delete(_token) {
        // 删除
        const result = await this.ctx.model.User.findOneAndRemove({ token: _token }).exec();
        // 通过usertoken获得用户信息
        const userInfo = await this.getUserInfoForToken(_token);
        const userInfoToken = userInfo.usertoken;
        // 清空登录态
        this.app.redis.set(`${userInfoToken}_user_login`, '');
        return result;
    }

    // 更新用户登录态随机数
    async updateUserToken(opt) {
        const query = {};
        if (opt.username) {
            query.user_name = opt.username;
        } else if (opt.token) {
            query.token = opt.token;
        }
        const result = await this.ctx.model.User.update(
            query,
            { usertoken: opt.usertoken },
            { multi: true }
        ).exec();

        return result;
    }

    // 根据token查询用户信息
    async finUserForToken(usertoken) {
        let user_info = await this.app.redis.get(`${usertoken}_user_login`);

        if (user_info) {
            user_info = JSON.parse(user_info);
            if (user_info.is_use !== 0) return { desc: '用户被冻结不能登录，请联系管理员！' };
        } else {
            return null;
        }
        return await this.ctx.model.User.findOne({ token: user_info.token }).exec();
    }

    // 根据github node_id 获得用户是否已存在
    async getUserInfoForGithubId(id) {
        return await this.ctx.model.User.findOne({ token: id }).exec() || {};
    }

    // github register
    async githubRegister(data = {}) {
        const login = data.login;
        const token = data.node_id;
        let userInfo = {};
        if (!login || !token) {
            userInfo = { desc: 'github 权限验证失败, 请重试！' };
            return;
        }

        userInfo = await this.getUserInfoForGithubId(token);
        const random_key = this.app.randomString();
        if (userInfo.token) {
            // 存在则直接登录
            if (userInfo.is_use !== 0) {
                userInfo = { desc: '用户被冻结不能登录，请联系管理员！' };
            } else {
                // 设置redis登录态
                this.app.redis.set(`${random_key}_user_login`, JSON.stringify(userInfo), 'EX', this.app.config.user_login_timeout);
                // 设置登录cookie
                this.ctx.cookies.set('usertoken', random_key, {
                    maxAge: this.app.config.user_login_timeout * 1000,
                    httpOnly: true,
                    encrypt: true,
                    signed: true,
                });
                // 更新用户信息
                await this.updateUserToken({ username: login, usertoken: random_key });
            }
        } else {
            // 不存在 先注册 再登录
            const user = this.ctx.model.User();
            user.user_name = login;
            user.token = token;
            user.create_time = new Date();
            user.level = 1;
            user.usertoken = random_key;
            userInfo = await user.save();
            // 设置redis登录态
            this.app.redis.set(`${random_key}_user_login`, JSON.stringify(userInfo), 'EX', this.app.config.user_login_timeout);
            // 设置登录cookie
            this.ctx.cookies.set('usertoken', random_key, {
                maxAge: this.app.config.user_login_timeout * 1000,
                httpOnly: true,
                encrypt: true,
                signed: true,
            });
        }
        return userInfo;
    }
}

module.exports = UserService;
