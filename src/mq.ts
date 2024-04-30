import amqp, { Channel } from "amqplib";
import {
  ExchangeData,
  MQConfig,
  QueueData,
  RabbitMqInterface,
} from "./types/mq.types";

export class RabbitMq<T> implements RabbitMqInterface<T> {
  private channel!: Channel;
  private queueMetadata: QueueData[];
  private mqConfig: MQConfig;

  constructor(queueMetadata: QueueData[], mqConfig: MQConfig) {
    this.queueMetadata = queueMetadata;
    this.mqConfig = mqConfig;
    this.init();
  }

  async init() {
    try {
      const connection = await amqp.connect(this.mqConfig.queue_url);
      this.channel = await connection.createChannel();
    } catch (err) {
      throw new Error("MQ Connection Failed");
    }
  }

  async publishExchange(data: ExchangeData<T>) {
    try {
      const { exchange, exchangeType, options, body } = data;

      await this.assertExchange(exchange, exchangeType, options);

      this.channel.publish(
        exchange,
        body.properties.routing_key,
        Buffer.from(JSON.stringify(body.payload)),
        options
      );
    } catch (err) {
      throw new Error("MQ Publish Failed");
    }
  }

  async assertExchange(
    exchange: string,
    exchangeType: string,
    options?: object
  ): Promise<void> {
    await this.channel.assertExchange(exchange, exchangeType, options);
  }

  async subscribeToQueues(): Promise<void> {
    for (const data of this.queueMetadata) {
      await this.assertExchange(data.exchange, data.exchangeType, data.options);

      await this.channel.assertQueue(data.queue, data.options);

      await this.channel.bindQueue(data.queue, data.exchange, data.routingKey);

      for (let i = 0; i < this.mqConfig.queue_consumers; i++) {
        this.consumeQueue(data);
      }
    }
  }

  consumeQueue(data: QueueData): void {
    this.channel.consume(
      data.queue,
      (msg) => {
        data.handler(msg, this.channel);
      },
      {
        noAck: true,
      }
    );
  }
}
