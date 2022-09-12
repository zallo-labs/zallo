import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SiweMessage } from 'siwe';

import CONFIG, { IS_DEV } from 'config';
import { VALIDATION_CHECKS } from './message.validation';

interface Token {
  message: SiweMessage;
  signature: string;
}

const parseToken = (token: string): Token => {
  const { message, signature }: Token = JSON.parse(token);
  return { message: new SiweMessage(message), signature };
};

const isLocalPlayground = (req: Request) =>
  req.headers.origin?.endsWith(`[::1]:${CONFIG.api.port}`) ||
  req.headers.origin?.startsWith('https://studio.apollographql.com');

const isIntrospection = (req: Request) =>
  req.body?.operationName === 'IntrospectionQuery';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (token) {
      const { message, signature } = parseToken(token);

      for (const [fallbackErr, isError] of Object.entries(VALIDATION_CHECKS)) {
        const r = await isError({ msg: message, sig: signature, req });
        if (r) {
          const err = typeof r === 'string' ? r : fallbackErr;
          Logger.debug(`Message rejected with: ${err}`);
          throw new UnauthorizedException(err);
        }
      }

      // Use the session expiry time if provided
      if (message.expirationTime)
        req.session.cookie.expires = new Date(message.expirationTime);

      req.deviceMessage = message;
    } else if (IS_DEV && isLocalPlayground(req) && !isIntrospection(req)) {
      req.deviceMessage = new SiweMessage({
        address: CONFIG.wallet.address,
      });
    }

    next();
  }
}
