import { ExchangeData, MQConfig, QueueData, RabbitMqInterface } from "./types/mq.types";
export declare class RabbitMq<T> implements RabbitMqInterface<T> {
    private channel;
    private queueMetadata;
    private mqConfig;
    constructor(queueMetadata: QueueData[], mqConfig: MQConfig);
    init(): Promise<void>;
    publishExchange(data: ExchangeData<T>): Promise<void>;
    assertExchange(exchange: string, exchangeType: string, options?: object): Promise<void>;
    subscribeToQueues(): Promise<void>;
    consumeQueue(data: QueueData): void;
}
