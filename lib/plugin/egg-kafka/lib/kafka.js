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

    consumer(type = 'web', fn) {
        assert(type, '[egg-kafka] consumers type argument must be required');
        const kafkaConfig = this.app.config.kafka;
        const consumer = kafkaConfig.consumer[type] || {};
        const consumers = Array.isArray(consumer) ? consumer : [ consumer ];
        const Consumer = kafka.Consumer;
        const _consumer = new Consumer(
            this.client,
            consumers,
            {
                autoCommit: true,
            }
        );
        _consumer.on('error', err => {
            this.app.coreLogger.error(`[egg-kafka] consumer have error ${err}`);
        });
        _consumer.on('message', message => {
            fn && fn(message);
        });
    }

    consumerGroup(type = 'web', fn) {
        assert(type, '[egg-kafka] consumers type argument must be required');
        const kafkaConfig = this.app.config.kafka;
        const kafkaHost = kafkaConfig.client.kafkaHost;
        const consumerOption = kafkaConfig.consumerGroup[type] || {};
        const topic = consumerOption.topic;
        consumerOption.kafkaHost = kafkaHost;
        const ConsumerGroup = kafka.ConsumerGroup;
        const _consumer = new ConsumerGroup(consumerOption, topic);
        _consumer.on('error', err => {
            this.app.coreLogger.error(`[egg-kafka] consumer have error ${err}`);
        });
        _consumer.on('message', message => {
            fn && fn(message);
        });
    }

    createTopics(topics) {
        assert(Array.isArray(topics), '[egg-kafka] createTopics opction must be Array.');
        this.client.createTopics(topics, error => {
            if (error) this.app.coreLogger.error(`[egg-kafka] createTopics have error ${error}`);
        });
    }

    send(type, data) {
        assert(type, '[egg-kafka] type is must required.');
        if (!data) return;
        let producer = this.app.config.kafka.producer[type] || {};
        let producers = [];
        if (typeof (data) === 'string') {
            producer.messages = data;
            producers = [ producer ];
        } else if (Object.prototype.toString.call(data) === '[object Object]') {
            producer = Object.assign({}, producer, data);
            producers = [ producer ];
        } else if (Object.prototype.toString.call(data) === '[object Array]') {
            for (let i = 0; i < data.length; i++) {
                data[i] = Object.assign({}, producer, data[i]);
            }
            producers = data;
        }
        this.producer.send(producers, (err, data) => {
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
