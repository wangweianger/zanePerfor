'use strict';

const Service = require('egg').Service;

class WebSystemService extends Service {

    // 保存用户上报的数据
    async saveSystemData(ctx) {
        const query = ctx.request.body;
        const type = query.type;
        // 参数校验
        if (!query.system_domain && type === 'web') throw new Error('新增系统信息操作：系统域名不能为空');
        if (!query.app_id && type === 'wx') throw new Error('新增系统信息操作：appId不能为空');
        if (!query.system_name) throw new Error('新增系统信息操作：系统名称不能为空');

        // 检验系统是否存在
        const search = await ctx.model.System.findOne({ system_domain: query.system_domain }).exec();
        if (search && search.system_domain) throw new Error('新增系统信息操作：系统已存在');

        // 存储数据
        const token = this.app.randomString();
        const system = ctx.model.System();
        system.system_domain = query.system_domain;
        system.system_name = query.system_name;
        system.type = query.type;
        system.app_id = token;
        system.user_id = [];
        system.create_time = new Date();
        system.is_use = query.is_use;
        system.slow_page_time = query.slow_page_time || 5;
        system.slow_js_time = query.slow_js_time || 2;
        system.slow_css_time = query.slow_css_time || 2;
        system.slow_img_time = query.slow_img_time || 2;
        system.slow_ajax_time = query.slow_ajax_time || 2;
        system.is_statisi_pages = query.is_statisi_pages;
        system.is_statisi_ajax = query.is_statisi_ajax;
        system.is_statisi_resource = query.is_statisi_resource;
        system.is_statisi_system = query.is_statisi_system;
        system.is_statisi_error = query.is_statisi_error;

        const result = await system.save();
        ctx.body = this.app.result({
            data: result,
        });
        // 存储到redis
        await this.app.redis.set(token, JSON.stringify(result));
    }
    // 保存用户上报的数据
    async updateSystemData(ctx) {
        const query = ctx.request.body;
        const appId = query.app_id;
        // 参数校验
        if (!appId) throw new Error('更新系统信息操作：app_id不能为空');

        const update = { $set: {
            is_use: query.is_use || 0,
            system_name: query.system_name || '',
            system_domain: query.system_domain || '',
            slow_page_time: query.slow_page_time || 5,
            slow_js_time: query.slow_js_time || 2,
            type: query.type || 'web',
            slow_css_time: query.slow_css_time || 2,
            slow_img_time: query.slow_img_time || 2,
            slow_ajax_time: query.slow_ajax_time || 2,
            is_statisi_pages: query.is_statisi_pages || 0,
            is_statisi_ajax: query.is_statisi_ajax || 0,
            is_statisi_resource: query.is_statisi_resource || 0,
            is_statisi_system: query.is_statisi_system || 0,
            is_statisi_error: query.is_statisi_error || 0,
        } };
        const result = await this.ctx.model.System.update(
            { app_id: appId },
            update,
            { multi: true }
        ).exec();
        ctx.body = this.app.result({ data: result });

        // 更新redis缓存
        const system = await this.getSystemForDb(appId);
        await this.app.redis.set(appId, JSON.stringify(system));
    }
    // 获得某个系统信息(redis)
    async getSystemForAppId(appId) {
        if (!appId) throw new Error('查询某个系统信：appId不能为空');

        const result = await this.app.redis.get(appId) || '{}';
        return JSON.parse(result);
    }
    // 获得某个系统信息(数据库)
    async getSystemForDb(appId) {
        if (!appId) throw new Error('查询某个系统信：appId不能为空');

        return await this.ctx.model.System.findOne({ app_id: appId }).exec() || {};
    }
    // 根据用户id获取系统列表
    async getSysForUserId(ctx) {
        const token = ctx.request.query.token;
        if (!token) return [];
        return await ctx.model.System.where('user_id').elemMatch({ $eq: token }).exec() || [];
    }
    // 获得系统列表信息
    async getWebSystemList() {
        return await this.ctx.model.System.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: 'token',
                    as: 'userlist',
                },
            },
        ]).exec();
    }
    // 删除系统中某个用户
    async deleteWebSystemUser(appId, userToken) {
        return await this.ctx.model.System.update(
            { app_id: appId },
            { $pull: { user_id: userToken } },
            { multi: true }).exec();
    }
    // 系统中新增某个用户
    async addWebSystemUser(appId, userToken) {
        return await this.ctx.model.System.update(
            { app_id: appId },
            { $addToSet: { user_id: userToken } },
            { multi: true }).exec();
    }
    // 删除某个系统
    async deleteSystem(appId) {
        const result = await this.ctx.model.System.findOneAndRemove({ app_id: appId }).exec();
        this.app.redis.set(appId, '');
        return result;
    }
}

module.exports = WebSystemService;
