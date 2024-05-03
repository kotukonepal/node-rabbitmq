import { Message, Channel, Options } from "amqplib";

export interface QueueData<T> {
  queueName: string;
  options?: object;
  payload: T;
}

export interface QueueMetaData {
  queue: string;
  options?: Options.AssertQueue;
  handler: (msg: Message | null) => Promise<void>;
  onError: (msg: Error | unknown) => void;
}

export interface RabbitMqInterface<T> {
  init(): Promise<{
    publishExchange: (data: QueueData<T>) => Promise<void>;
  }>;
}

export interface MQConfig {
  queue_url: string;
  queue_consumers: number;
}
