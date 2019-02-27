'use strict';
const path = require('path');

exports.ejs = {
    enable: true,
    package: 'egg-view-ejs',
};

exports.redis = {
    enable: true,
    package: 'egg-redis',
};

exports.mongoose = {
    enable: true,
    package: 'egg-mongoose',
};

exports.routerPlus = {
    enable: true,
    package: 'egg-router-plus',
};

exports.cors = {
    enable: true,
    package: 'egg-cors',
};

exports.email = {
    enable: true,
    path: path.join(__dirname, '../lib/plugin/egg-email'),
};

exports.kafka = {
    enable: true,
    path: path.join(__dirname, '../lib/plugin/egg-kafka'),
};

exports.alinode = {
    enable: false,
    package: 'egg-alinode',
};

