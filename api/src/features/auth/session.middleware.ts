import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { CONFIG } from '~/config';
import { Duration } from 'luxon';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';

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
