'use strict';

exports.kafka = {
    client: { // kafkaClient
        kafkaHost: 'localhost:9092',
    },
    producer: {
        topic: 'test',
        partition: 0, // default 0
        attributes: 0, // default: 0
        timestamp: Date.now(), // defaults to Date.now() (only available with kafka v0.10+)
    },
    consumer: {},
};
