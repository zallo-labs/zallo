import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private service: AuthService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    req.user = await this.service.tryAuth(req);
    next();
  }
}
