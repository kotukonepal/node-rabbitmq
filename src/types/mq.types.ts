import { Message, Channel, Options } from "amqplib";

export interface MessageBody<T> {
  payload: T;
  properties: {
    routing_key: string;
  };
}

export interface ExchangeData<T> {
  exchange: string;
  exchangeType: string;
  options?: object;
  body: MessageBody<T>;
}

export interface QueueData {
  queue: string;
  exchange: string;
  exchangeType: string;
  routingKey: string;
  options?: Options.AssertQueue;
  handler: (msg: Message | null, channel: Channel) => void;
}

export interface RabbitMqInterface<T> {
  init(): Promise<{
    publishExchange: (data: ExchangeData<T>) => Promise<void>;
  }>;
}

export interface MQConfig {
  queue_url: string;
  queue_consumers: number;
}
