'use strict';

const email = require('./lib/email');

module.exports = app => {
    email(app);
};

