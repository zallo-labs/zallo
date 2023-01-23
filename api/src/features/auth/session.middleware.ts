import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { SessionService } from './session.service';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private service: SessionService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.service.handler(req, res, next);
  }
}
