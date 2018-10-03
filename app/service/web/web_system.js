'use strict';

const Service = require('egg').Service;

class WebSystemService extends Service {

    // 保存用户上报的数据
    async saveSystemData(ctx) {
        const query = ctx.request.body;
        // 参数校验
        if (!query.systemDomain) throw new Error('新增系统信息操作：系统域名不能为空');
        if (!query.systemName) throw new Error('新增系统信息操作：系统名称不能为空');

        // 检验系统是否存在
        const search = await ctx.model.Web.WebSystem.findOne({ system_domain: query.systemDomain });
        if (search && search.system_domain) throw new Error('新增系统信息操作：系统已存在');

        // 存储数据
        const date = new Date();
        const token = this.app.signwx({
            systemName: query.systemName,
            systemDomain: query.systemDomain,
            timestamp: date,
            random: this.app.randomString(),
        }).paySign;

        const system = ctx.model.Web.WebSystem();
        system.system_domain = query.systemDomain;
        system.system_name = query.systemName;
        system.app_id = token;
        system.user_id = [];
        system.create_time = date;
        system.script = '';

        const result = await system.save();
        ctx.body = result;
        // 存储到redis
        await this.app.redis.set(token, JSON.stringify(result));
    }
    // 保存用户上报的数据
    async updateSystemData(ctx) {
        const query = ctx.request.body;
        // 参数校验
        if (!query.appId) throw new Error('更新系统信息操作：app_id不能为空');

        const where = { app_id: query.appId };
        const update = { $set: {
            is_use: query.isUse || 0,
            slow_page_time: query.slowPageTime || 5,
            slow_js_time: query.slowJsTime || 2,
            slow_css_time: query.slowCssTime || 2,
            slow_img_time: query.slowImgTime || 2,
            slow_ajax_time: query.slowAjaxTime || 2,
            is_statisi_pages: query.isStatisiPages || 0,
            is_statisi_ajax: query.isStatisiAjax || 0,
            is_statisi_resource: query.isStatisiResource || 0,
            is_statisi_system: query.isStatisiSystem || 0,
            is_statisi_error: query.isStatisiError || 0,
        } };
        const opts = { multi: true };
        const result = await this.ctx.model.Web.WebSystem.update(where, update, opts).exec();
        ctx.body = result;

        // 更新redis缓存
        await this.app.redis.set(query.appId, JSON.stringify(result));
    }
    // 获得某个系统信息
    async getSystemForAppId(appId) {
        if (!appId) throw new Error('查询某个系统信：app_id不能为空');

        const result = await this.app.redis.get(appId);
        return result;
    }
}

module.exports = WebSystemService;
