'use strict';

const Service = require('egg').Service;

class CacheService extends Service {
    /*
     * @param {*} key
     * @returns
     * @memberof CacheService
     */
    async get(key) {
        const { redis, logger } = this.app;
        const t = Date.now();
        let data = await redis.get(key);
        if (!data) return;
        data = JSON.parse(data);
        const duration = (Date.now() - t);
        logger.debug('Cache', 'get', key, (duration + 'ms').green);
        return data;
    }

    /*
     * @param {*} key
     * @param {*} value
     * @param {*} seconds
     * @memberof CacheService
     */
    async setex(key, value, seconds) {
        const { redis, logger } = this.app;
        const t = Date.now();
        value = JSON.stringify(value);
        await redis.set(key, value, 'EX', seconds);
        const duration = (Date.now() - t);
        logger.debug('Cache', 'set', key, (duration + 'ms').green);
    }

    /*
     * @param {*} key
     * @param {*} seconds
     * @returns
     * @memberof CacheService
     */
    async incr(key, seconds) {
        const { redis, logger } = this.app;
        const t = Date.now();
        const result = await redis.multi().incr(key).expire(key, seconds)
            .exec();
        const duration = (Date.now() - t);
        logger.debug('Cache', 'set', key, (duration + 'ms').green);
        return result[0][1];
    }
}

module.exports = CacheService;
