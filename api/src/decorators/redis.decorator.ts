import { InjectRedis } from '@liaoliaots/nestjs-redis';

export const REDIS_PUBLISHER = 'publisher';
export const REDIS_SUBSCRIBER = 'subscriber';

export const InjectRedisPub = (): ParameterDecorator => InjectRedis(REDIS_PUBLISHER);
export const InjectRedisSub = (): ParameterDecorator => InjectRedis(REDIS_SUBSCRIBER);
