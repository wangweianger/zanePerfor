'use strict';

const nodemailer = require('nodemailer');
const assert = require('assert');

module.exports = app => {
    app.addSingleton('email', createOneClient);
};

function createOneClient(config, app) {

    console.log('+++++++++++');
    console.log(config);

    const isHostProt = config.host && config.port && typeof (config.secure) === 'boolean';
    const service = config.service;

    assert((isHostProt || service) && config.auth, '[egg-email] host and prot or service are require on config');

    app.coreLogger.info('[egg-email] connecting success!');

    const smtpTransport = nodemailer.createTransport(config);

    return smtpTransport;
}
