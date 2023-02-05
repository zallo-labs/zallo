import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express';
import session from 'express-session';
import createStore from 'connect-redis';
import { CONFIG } from '~/config';
import { Duration } from 'luxon';
import Redis from 'ioredis';
import { InjectRedisPub } from '~/decorators/redis.decorator';

const RedisStore = createStore(session);

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private handler: RequestHandler;

  constructor(@InjectRedisPub() redis: Redis) {
    this.handler = session({
      secret: CONFIG.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: Duration.fromObject({ days: 7 }).toMillis(),
        secure: 'auto',
        sameSite: 'none', // Required by apollo studio when includeCookies=true
      },
      store: new RedisStore({ client: redis }),
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.handler(req, res, next);
  }
}
