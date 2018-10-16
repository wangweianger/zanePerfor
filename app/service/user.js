/* eslint-disable */
'use strict';

const Service = require('egg').Service;

class UserService extends Service {

    // 用户登录
    async login(userName, passWord) {
        // 检测用户是否存在
        const userInfo = await this.getUserInfoForUserName(userName);
        if (!userInfo.token) throw new Error('用户名不存在！');
        if (userInfo.pass_word !== passWord) throw new Error('用户密码不正确！');
        // 设置登录cookie
        this.ctx.cookies.set('usertoken', userInfo.token);
        return userInfo
    }

    // 用户注册
    async register(userName, passWord) {
        // 检测用户是否存在
        const userInfo = await this.getUserInfoForUserName(userName);
        if (userInfo.token) throw new Error('用户注册：用户已存在！');

        // 新增用户
        const token = this.app.signwx({
            mark: 'markuser',
            timestamp: new Date().getTime(),
            random: this.app.randomString(),
        }).paySign;
        
        const user = this.ctx.model.User();
        user.user_name = userName;
        user.pass_word = passWord;
        user.token = token;
        user.create_time =  new Date();

        // 设置登录cookie
        this.ctx.cookies.set('usertoken', token);

        return await user.save();
    }

    // 根据用户名称查询用户信息
    async getUserInfoForUserName(userName){
        return await this.ctx.model.User.findOne({ user_name: userName }) || {};
        
    }
}

module.exports = UserService;
