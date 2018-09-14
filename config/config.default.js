'use strict';

module.exports = appInfo => {
    const config = exports = {};

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_1536915742607_3127';

    // add your config here
    config.middleware = [];


    config.name = 'CNode技术社区';

  	config.description = 'CNode：Node.js专业中文社区';

  	// debug 为 true 时，用于本地调试
  	

  	config.host = 'http://cnodejs.org';

  	config.session_secret = 'node_club_secret'; // 务必修改config.debug = true;

    // ejs模板
    config.view = {
    	defaultExtension: '.html',
	  	mapping: {
	    	'.html': 'ejs',
	  	},
	}
	config.ejs = {
		layout: 'layout.html',
	}

    return config;
};

