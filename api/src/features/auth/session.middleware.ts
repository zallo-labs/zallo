import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRedis } from '@songkeys/nestjs-redis';
import RedisStore from 'connect-redis';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import { Duration } from 'luxon';

import { CONFIG } from '~/config';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private handler: RequestHandler;

  constructor(@InjectRedis() redis: Redis) {
    this.handler = session({
      secret: CONFIG.sessionSecret,
      store: new RedisStore({ client: redis }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: Duration.fromObject({ days: 7 }).toMillis(),
        secure: 'auto',
        sameSite: 'none', // Required by apollo studio when includeCookies=true
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.handler(req, res, next);
  }
}
