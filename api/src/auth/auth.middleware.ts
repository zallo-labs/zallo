import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SiweMessage } from 'siwe';

import { IS_DEV } from '~/config';
import { ProviderService } from '~/provider/provider.service';
import { VALIDATION_CHECKS } from './message.validation';

interface Token {
  message: SiweMessage;
  signature: string;
}

const tryParseToken = (token?: string): Token | undefined => {
  try {
    if (token) {
      const { message, signature }: Token = JSON.parse(token);
      return { message: new SiweMessage(message), signature };
    }
  } catch {
    // return undefined
  }
};

const PLAYGROUND_HOSTS = new Set(['studio.apollographql.com', '[::1]']);

const isLocalDevPlayground = (req: Request) => {
  const isLocalPlayground =
    req.headers.origin && PLAYGROUND_HOSTS.has(new URL(req.headers.origin).hostname);

  const isIntrospection = req.body?.operationName === 'IntrospectionQuery';

  return IS_DEV && isLocalPlayground && !isIntrospection;
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private provider: ProviderService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const token = tryParseToken(req.headers.authorization);
    if (token) {
      const { message, signature } = token;

      for (const [fallbackErr, isError] of Object.entries(VALIDATION_CHECKS)) {
        const r = await isError({ msg: message, sig: signature, req });
        if (r) {
          const err = typeof r === 'string' ? r : fallbackErr;
          Logger.debug(`Message rejected with: ${err}`);
          throw new UnauthorizedException(err);
        }
      }

      // Use the session expiry time if provided
      if (message.expirationTime) req.session.cookie.expires = new Date(message.expirationTime);

      req.deviceMessage = message;
    } else if (isLocalDevPlayground(req)) {
      req.deviceMessage = new SiweMessage({
        address: this.provider.wallet.address,
      });
    }

    next();
  }
}
