"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMq = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
class RabbitMq {
    channel;
    queueMetadata;
    mqConfig;
    constructor(queueMetadata, mqConfig) {
        this.queueMetadata = queueMetadata;
        this.mqConfig = mqConfig;
        this.init();
    }
    async init() {
        try {
            const connection = await amqplib_1.default.connect(this.mqConfig.queue_url);
            this.channel = await connection.createChannel();
        }
        catch (err) {
            throw new Error("MQ Connection Failed");
        }
    }
    async publishExchange(data) {
        try {
            const { exchange, exchangeType, options, body } = data;
            await this.assertExchange(exchange, exchangeType, options);
            this.channel.publish(exchange, body.properties.routing_key, Buffer.from(JSON.stringify(body.payload)), options);
        }
        catch (err) {
            throw new Error("MQ Publish Failed");
        }
    }
    async assertExchange(exchange, exchangeType, options) {
        await this.channel.assertExchange(exchange, exchangeType, options);
    }
    async subscribeToQueues() {
        for (const data of this.queueMetadata) {
            await this.assertExchange(data.exchange, data.exchangeType, data.options);
            await this.channel.assertQueue(data.queue, data.options);
            await this.channel.bindQueue(data.queue, data.exchange, data.routingKey);
            for (let i = 0; i < this.mqConfig.queue_consumers; i++) {
                this.consumeQueue(data);
            }
        }
    }
    consumeQueue(data) {
        this.channel.consume(data.queue, (msg) => {
            data.handler(msg, this.channel);
        }, {
            noAck: true,
        });
    }
}
exports.RabbitMq = RabbitMq;
//# sourceMappingURL=mq.js.map