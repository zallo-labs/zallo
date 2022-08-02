import { Module } from '@nestjs/common';
import {
  NestSessionOptions,
  SessionModule as BaseSessionModule,
} from 'nestjs-session';
import CONFIG from 'config';
import { Duration } from 'luxon';
import { RedisModule, RedisService } from '@liaoliaots/nestjs-redis';
import session from 'express-session';
import createStore from 'connect-redis';
import { AuthController } from './auth.controller';

const RedisStore = createStore(session);

@Module({
  imports: [
    BaseSessionModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: async (redis: RedisService): Promise<NestSessionOptions> => ({
        session: {
          secret: CONFIG.sessionSecret!,
          resave: false,
          saveUninitialized: false,
          cookie: {
            maxAge: Duration.fromObject({ days: 7 }).toMillis(),
            secure: true,
            sameSite: 'none',
          },
          store: new RedisStore({ client: redis.getClient() }),
        },
      }),
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
