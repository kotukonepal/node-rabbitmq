import amqp, { Channel } from "amqplib";
import {
  ExchangeData,
  MQConfig,
  QueueData,
  RabbitMqInterface,
} from "./types/mq.types";
import {
  ConnectionFailError,
  MessagePublishError,
  ValidationError,
} from "../utils/error/errors";
import { validatePublishMessage } from "../utils/validation";

export class RabbitMq<T> implements RabbitMqInterface<T> {
  private channel!: Channel;
  private queueMetadata: QueueData[];
  private mqConfig: MQConfig;

  constructor(queueMetadata: QueueData[], mqConfig: MQConfig) {
    this.queueMetadata = queueMetadata;
    this.mqConfig = mqConfig;
  }

  async init() {
    try {
      const connection = await amqp.connect(this.mqConfig.queue_url);
      this.channel = await connection.createChannel();
      await this.subscribeToQueues();
      return {
        publishExchange: this.publishExchange.bind(this),
      };
    } catch (err) {
      throw new ConnectionFailError("Error connecting to amqp server");
    }
  }

  private async publishExchange(data: ExchangeData<T>) {
    try {
      validatePublishMessage(data);
      const {
        exchange,
        exchangeType,
        options,
        body: {
          properties: { routing_key },
          payload,
        },
      } = data;

      await this.assertExchange(exchange, exchangeType, options);

      this.channel.publish(
        exchange,
        routing_key,
        Buffer.from(JSON.stringify(payload)),
        options
      );
    } catch (err) {
      if (err instanceof ValidationError) {
        console.error("Validation Error:", err.message);
      } else
        throw new MessagePublishError("Failed to publish message to queue");
    }
  }

  private async assertExchange(
    exchange: string,
    exchangeType: string,
    options?: object
  ): Promise<void> {
    await this.channel.assertExchange(exchange, exchangeType, options);
  }

  private async subscribeToQueues(): Promise<void> {
    for (const data of this.queueMetadata) {
      await this.assertExchange(data.exchange, data.exchangeType, data.options);

      await this.channel.assertQueue(data.queue, data.options);

      await this.channel.bindQueue(data.queue, data.exchange, data.routingKey);
      for (let i = 0; i < this.mqConfig.queue_consumers; i++) {
        this.consumeQueue(data);
      }
    }
  }

  private consumeQueue(data: QueueData): void {
    const { queue, handler } = data;
    this.channel.consume(queue, (msg) => {
      handler(msg, this.channel);
    });
  }
}
