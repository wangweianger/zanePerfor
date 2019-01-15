'use strict';

const assert = require('assert');
const kafka = require('kafka-node');

module.exports = app => {
    app.addSingleton('kafka', createClient);
};

class Kafka {
    constructor(config, app) {
        this.config = config || {};
        this.app = app;
        this.client = null;
        this.producer = null;
        this.consumer = null;
        this.init();
    }

    init() {
        assert(this.config.kafkaHost, '[egg-kafka] kafkaHost is required on config');
        this.client = new kafka.KafkaClient(this.config);
        this.producers();
    }

    producers() {
        const Producer = kafka.Producer;
        this.producer = new Producer(this.client);
        this.producer.on('ready', () => {
            this.app.coreLogger.info('[egg-kafka] the producer is ready.');
        });
        this.producer.on('error', err => {
            this.app.coreLogger.error(`[egg-kafka] have error ${err}`);
        });
    }

    send(data) {
        if (!data) return;
        assert(this.app.config.kafka.producer, '[egg-kafka] producer is required on config');
        let producer = this.app.config.kafka.producer;
        let msgs = {};
        if (typeof (data) === 'string') {
            msgs = producer;
            msgs.messages = data;
        } else if (Object.prototype.toString.call(data) === '[object Object]') {
            producer = Object.assign({}, producer, data);
        } else if (Object.prototype.toString.call(data) === '[object Array]') {
            for (let i = 0; i < data.length; i++) {
                data[i] = Object.assign({}, producer, data[i]);
            }
            producer = data;
        }
        this.producer.send(producer, (err, data) => {
            if (err) assert(err, '[egg-kafka] err. errmsg ${err}');
            console.log(data);
        });
    }
}

function createClient(config, app) {
    const kafka = new Kafka(config, app);
    kafka.init();

    return kafka;
}
