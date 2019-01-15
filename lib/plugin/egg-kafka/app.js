'use strict';

const kafka = require('./lib/kafka');

module.exports = app => {
    if (app.config.report_data_type === 'kafka') kafka(app);
};

