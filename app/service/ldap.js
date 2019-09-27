'use strict';

const ldap = require('ldapjs');
const Service = require('egg').Service;

class LdapService extends Service {
    constructor(ctx) {
        super(ctx);
        const { server, ou, dc } = ctx.app.config.ldap;
        this.config = { ou, dc };
        this.client = ldap.createClient({
            url: server,
        });
    }

    /*
     *
     *
     * @param {*} userName
     * @returns
     * @memberof LdapService
     */
    search(userName) {
        const { ou, dc } = this.config;
        return new Promise((resolve, reject) => {
            const str = `cn=${userName}, ou=${ou}, dc=${dc}, dc=com`;
            this.client.search(str, {}, (err, res) => {
                if (err) {
                    this.ctx.logger.error(`ldap search error:${err.stack}`);
                    reject(err);
                }
                res.on('searchEntry', entry => {
                    resolve(entry.object);
                });
                res.on('error', err => {
                    this.ctx.logger.error(`ldap search searchEntry error:${err.stack}`);
                    reject(err);
                });
                res.on('end', err => {
                    if (err) reject(err);
                });
            });
        });
    }
}

module.exports = LdapService;
