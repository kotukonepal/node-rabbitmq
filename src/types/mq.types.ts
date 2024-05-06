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
  onComplete: <T = unknown>(data: T) => void;
}

export interface RabbitMqInterface {
  init(): Promise<BrokerInterface>;
}

export interface MQConfig {
  queue_url: string;
  queue_consumers: number;
}

export interface BrokerInterface {
  publishExchange: <T>(data: QueueData<T>) => Promise<void>;
  subscribeToQueues: () => Promise<void>;
}
