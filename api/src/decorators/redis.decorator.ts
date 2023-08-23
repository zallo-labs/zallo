import { InjectRedis } from '@songkeys/nestjs-redis';

export const REDIS_SUBSCRIBER = 'subscriber';

export const InjectRedisSubscriber = (): ParameterDecorator => InjectRedis(REDIS_SUBSCRIBER);
