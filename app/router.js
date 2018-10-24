'use strict';

module.exports = app => {
    require('./router/home')(app);
    require('./router/api')(app);
    require('./router/web/web')(app);
    require('./router/web/api')(app);
    require('./router/wx/web')(app);
    require('./router/wx/api')(app);
};
