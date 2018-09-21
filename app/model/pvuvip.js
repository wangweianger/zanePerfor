'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const ObjectId = Schema.ObjectId;

    const PvUvIpSchema = new Schema({
        id: { type: ObjectId },
        data_time: { type: Date, default: Date.now },
        pv: { type: Number, default: 0 },
        uv: { type: Number, default: 0 },
        ip: { type: Number, default: 0 },
    });

    PvUvIpSchema.index({ pv: 1, uv: 1, ip: 1, data_time: -1 });

    return mongoose.model('Pvuvip', PvUvIpSchema);
};
