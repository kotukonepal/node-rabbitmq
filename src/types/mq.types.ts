import { Message, Channel, Options } from "amqplib";

interface ObjectInterface {
  [x: string]: any;
}

export interface QueueData<T> {
  queueName: string;
  options?: object;
  payload: T;
}

export interface QueueMetaData {
  queue: string;
  options?: Options.AssertQueue;
  handler: (data: ObjectInterface) => Promise<void>;
  onError: (msg: Error | unknown) => Promise<void>;
  onComplete: (data: ObjectInterface) => Promise<void>;
  noAck: boolean;
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
