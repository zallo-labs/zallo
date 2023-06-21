import { HttpStatus, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { BULL_BOARD_CREDS } from './bull.util';

export class BasicAuthMiddleware implements NestMiddleware {
  private readonly encodedCreds =
    BULL_BOARD_CREDS &&
    Buffer.from(BULL_BOARD_CREDS.username + ':' + BULL_BOARD_CREDS.password).toString('base64');

  use(req: Request, res: Response, next: NextFunction) {
    const reqCreds = req.get('authorization')?.split('Basic ')?.[1] ?? null;

    if (this.encodedCreds && reqCreds !== this.encodedCreds) {
      res.setHeader('WWW-Authenticate', 'Basic realm="realm", charset="UTF-8"');
      res.sendStatus(HttpStatus.UNAUTHORIZED);
    } else {
      next();
    }
  }
}
