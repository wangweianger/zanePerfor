'use strict';

const Service = require('egg').Service;

class SystemService extends Service {

    /*
     * 保存用户上报的数据
     *
     * @param {*} ctx
     * @memberof SystemService
     */
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
        const token = query.app_id ? query.app_id : this.app.randomString();

        const system = ctx.model.System();
        system.system_domain = query.system_domain;
        system.system_name = query.system_name;
        system.type = query.type;
        system.app_id = token;
        system.user_id = [ query.token || '' ];
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
        this.updateSystemCache(token);
    }

    /*
     * 保存用户上报的数据
     *
     * @param {*} ctx
     * @memberof SystemService
     */
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
            is_daily_use: query.is_daily_use || 0,
        } };
        const result = await this.ctx.model.System.update(
            { app_id: appId },
            update,
            { multi: true }
        ).exec();
        ctx.body = this.app.result({ data: result });

        // 更新redis缓存
        this.updateSystemCache(appId);
    }

    /*
     * 更新redis缓存
     *
     * @param {*} appId
     * @memberof SystemService
     */
    async updateSystemCache(appId) {
        const system = await this.getSystemForDb(appId);
        await this.app.redis.set(appId, JSON.stringify(system));
    }

    /*
     * 获得某个系统信息(redis)
     *
     * @param {*} appId
     * @return
     * @memberof SystemService
     */
    async getSystemForAppId(appId) {
        if (!appId) throw new Error('查询某个系统信：appId不能为空');

        const result = await this.app.redis.get(appId) || '{}';
        return JSON.parse(result);
    }

    /*
     * 获得某个系统信息(数据库)
     *
     * @param {*} appId
     * @returns
     * @memberof SystemService
     */
    async getSystemForDb(appId) {
        if (!appId) throw new Error('查询某个系统信：appId不能为空');

        return await this.ctx.model.System.findOne({ app_id: appId }).exec() || {};
    }

    /*
     * 根据用户id获取系统列表
     *
     * @param {*} ctx
     * @returns
     * @memberof SystemService
     */
    async getSysForUserId(ctx) {
        const token = ctx.request.query.token;
        if (!token) return [];
        return await ctx.model.System.where('user_id').elemMatch({ $eq: token }).exec() || [];
    }

    /*
     * 获得系统列表信息
     *
     * @returns
     * @memberof SystemService
     */
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

    /*
     * 删除系统中某个用户
     *
     * @param {*} appId
     * @param {*} userToken
     * @returns
     * @memberof SystemService
     */
    async deleteWebSystemUser(appId, userToken) {
        return await this.ctx.model.System.update(
            { app_id: appId },
            { $pull: { user_id: userToken } },
            { multi: true }).exec();
    }

    /* 系统中新增某个用户
     * @param {*} appId
     * @param {*} userToken
     * @return
     * @memberof SystemService
     */
    async addWebSystemUser(appId, userToken) {
        return await this.ctx.model.System.update(
            { app_id: appId },
            { $addToSet: { user_id: userToken } },
            { multi: true }).exec();
    }

    /*
     * 删除某个系统
     *
     * @param {*} appId
     * @return
     * @memberof SystemService
     */
    async deleteSystem(appId) {
        const result = await this.ctx.model.System.findOneAndRemove({ app_id: appId }).exec();
        this.app.redis.set(appId, '', 'EX', 200);
        setTimeout(async () => {
            const conn = this.app.mongooseDB.get('db3');
            try { await conn.dropCollection(`web_pages_${appId}`); } catch (err) { console.log(err); }
            try { await conn.dropCollection(`web_ajaxs_${appId}`); } catch (err) { console.log(err); }
            try { await conn.dropCollection(`web_errors_${appId}`); } catch (err) { console.log(err); }
            try { await conn.dropCollection(`web_resources_${appId}`); } catch (err) { console.log(err); }
            try { await conn.dropCollection(`web_environment_${appId}`); } catch (err) { console.log(err); }
        }, 500);
        return result;
    }

    /*
     * 新增 | 删除 日报邮件
     * item: 1:日报邮件发送  2：流量峰值邮件发送
     * @param {*} appId
     * @param {*} email
     * @param {*} type
     * @param {boolean} [handleEmali=true]
     * @param {number} [item=1]
     * @return
     * @memberof SystemService
     */
    async handleDaliyEmail(appId, email, type, handleEmali = true, item = 1) {
        type = type * 1;
        item = item * 1;
        let handleData = null;
        if (item === 1) {
            handleData = type === 1 ? { $addToSet: { daliy_list: email } } : { $pull: { daliy_list: email } };
        } else if (item === 2) {
            handleData = type === 1 ? { $addToSet: { highest_list: email } } : { $pull: { highest_list: email } };
        }
        const result = await this.ctx.model.System.update(
            { app_id: appId },
            handleData,
            { multi: true }).exec();

        // 更新redis缓存
        this.updateSystemCache(appId);

        // 更新邮件相关信息
        if (handleEmali) this.updateEmailSystemIds(email, appId, type, item);

        return result;
    }

    /*
     * 更新邮件信息
     *
     * @param {*} email
     * @param {*} appId
     * @param {number} [handletype=1]
     * @param {number} [handleitem=1]
     * @returns
     * @memberof SystemService
     */
    async updateEmailSystemIds(email, appId, handletype = 1, handleitem = 1) {
        if (!email) return;
        await this.ctx.service.emails.updateSystemIds({
            email,
            appId,
            handletype,
            handleitem,
        });
    }
}

module.exports = SystemService;
