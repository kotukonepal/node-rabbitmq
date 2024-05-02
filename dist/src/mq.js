"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMq = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const errors_1 = require("../utils/error/errors");
const validation_1 = require("../utils/validation");
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
            if (!this.channel) {
                const connection = await amqplib_1.default.connect(this.mqConfig.queue_url);
                this.channel = await connection.createChannel();
            }
        }
        catch (err) {
            throw new errors_1.ConnectionFailError("Error connecting to amqp server");
        }
    }
    async publishExchange(data) {
        try {
            (0, validation_1.validatePublishMessage)(data);
            const { exchange, exchangeType, options, body: { properties: { routing_key }, payload, }, } = data;
            await this.assertExchange(exchange, exchangeType, options);
            this.channel.publish(exchange, routing_key, Buffer.from(JSON.stringify(payload)), options);
        }
        catch (err) {
            if (err instanceof errors_1.ValidationError) {
                console.error("Validation Error:", err.message);
            }
            else
                throw new errors_1.MessagePublishError("Failed to publish message to queue");
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
        const { queue, handler } = data;
        this.channel.consume(queue, (msg) => {
            handler(msg, this.channel);
        });
    }
}
exports.RabbitMq = RabbitMq;
//# sourceMappingURL=mq.js.map