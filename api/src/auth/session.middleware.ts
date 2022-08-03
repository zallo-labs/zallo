import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import session from 'express-session';
import createStore from 'connect-redis';
import CONFIG from 'config';
import { Duration } from 'luxon';

const RedisStore = createStore(session);

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private sessionHandler: RequestHandler;

  constructor(redisService: RedisService) {
    this.sessionHandler = session({
      secret: CONFIG.sessionSecret!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: Duration.fromObject({ days: 7 }).toMillis(),
        // secure: true,
        // sameSite: true,    // Enable once secure=true is enabled
      },
      store: new RedisStore({ client: redisService.getClient() }),
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.sessionHandler(req, res, next);
  }
}
