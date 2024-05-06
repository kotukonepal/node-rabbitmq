import amqp, { Channel } from "amqplib";
import {
  QueueData,
  MQConfig,
  QueueMetaData,
  RabbitMqInterface,
} from "./types/mq.types";
import {
  ConnectionFailError,
  MessagePublishError,
  ValidationError,
} from "../utils/error/errors";
import { validatePublishMessage } from "../utils/validation";

export class RabbitMq implements RabbitMqInterface {
  private channel!: Channel;
  private queueMetadata: QueueMetaData[];
  private mqConfig: MQConfig;

  constructor(queueMetadata: QueueMetaData[], mqConfig: MQConfig) {
    this.queueMetadata = queueMetadata;
    this.mqConfig = mqConfig;
  }

  async init() {
    try {
      const connection = await amqp.connect(this.mqConfig.queue_url);
      this.channel = await connection.createChannel();

      return {
        publishExchange: this.publishExchange.bind(this),
        subscribeToQueues: this.subscribeToQueues.bind(this),
      };
    } catch (err) {
      throw new ConnectionFailError("Error connecting to amqp server");
    }
  }

  private async publishExchange<T>(data: QueueData<T>) {
    try {
      validatePublishMessage(data);
      const { queueName, options, payload } = data;

      this.channel.assertQueue(queueName, { ...options });

      this.channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(payload)),
        {
          persistent: true,
        }
      );
    } catch (err) {
      if (err instanceof ValidationError) {
        console.error("Validation Error:", err.message);
      } else
        throw new MessagePublishError("Failed to publish message to queue");
    }
  }

  private async subscribeToQueues(): Promise<void> {
    for (const data of this.queueMetadata) {
      var queue = data.queue;

      this.channel.assertQueue(queue, {
        durable: true,
      });
      this.channel.prefetch(1);
      for (let i = 0; i < this.mqConfig.queue_consumers; i++) {
        this.consumeQueue(data);
      }
    }
  }

  private consumeQueue(data: QueueMetaData): void {
    const { queue, noAck = false } = data;
    this.channel.consume(
      queue,
      async (msg) => {
        if (!msg) return;

        if (!noAck) {
          await this.handlerWithAckOnError(data, msg);
          return;
        }
        await this.handlerWithoutAckOnError(data, msg);
      },
      {
        noAck: false,
      }
    );
  }

  private async handlerWithAckOnError(
    { handler, onComplete, onError }: QueueMetaData,
    msg: amqp.ConsumeMessage
  ) {
    const msgContent = JSON.parse(msg.content.toString());
    try {
      await handler(msgContent);
      await onComplete(msgContent);
    } catch (err: Error | unknown) {
      await onError(err);
    } finally {
      this.channel.ack(msg);
    }
  }

  private async handlerWithoutAckOnError(
    { handler, onComplete, onError }: QueueMetaData,
    msg: amqp.ConsumeMessage
  ) {
    const msgContent = JSON.parse(msg.content.toString());
    try {
      await handler(msgContent);
      await onComplete(msgContent);
      this.channel.ack(msg);
    } catch (err: Error | unknown) {
      await onError(err);
    }
  }
}
