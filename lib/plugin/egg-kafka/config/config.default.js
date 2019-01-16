'use strict';

exports.kafka = {
    client: { // kafkaClient
        kafkaHost: 'localhost:9092',
    },
    producer: {
        web: {
            topic: 'zane_perfor_web',
            partition: 0, // default 0
            attributes: 0, // default: 0
            // timestamp: Date.now(),
        },
        wx: {
            topic: 'zane_perfor_wx',
        },
    },
    consumer: {
        web: {
            topic: 'zane_perfor_web',
            offset: 0, // default 0
            partition: 0, // default 0
            isone: false, // 此参数默认不可更改
        },
        wx: {
            topic: 'zane_perfor_wx',
            isone: false,
        },
    },
};
