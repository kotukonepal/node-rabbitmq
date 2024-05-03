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

export class RabbitMq<T> implements RabbitMqInterface<T> {
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

  private async publishExchange(data: QueueData<T>) {
    try {
      validatePublishMessage(data);
      const { queueName, options, payload } = data;

      console.log(options);

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
    const { queue, handler, onError } = data;
    this.channel.consume(
      queue,
      async (msg) => {
        if (!msg) return;
        try {
          await handler(JSON.parse(msg.content.toString()), this.channel);
        } catch (err: Error | unknown) {
          onError(err);
        } finally {
          this.channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  }
}
