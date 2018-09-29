'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const Mixed = Schema.Types.Mixed;

    const ReportSchema = new Schema({
        app_id: { type: String },
        create_time: { type: Date, default: Date.now },
        user_agent: { type: String },
        ip: { type: String },
        mark_page: { type: String },
        mark_user: { type: String },
        url: { type: String },
        pre_url: { type: String },
        performance: { type: Mixed },
        error_list: { type: Mixed },
        resource_list: { type: Mixed },
        screenwidth: { type: Number },
        screenheight: { type: Number },
    });

    ReportSchema.index({ app_id: -1, create_time: 1, ip: -1, url: -1 });

    return mongoose.model('Usereport', ReportSchema);
};
