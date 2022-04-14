import { NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SiweMessage } from 'siwe';

import CONFIG, { IS_DEV } from 'config';
import { DateTime } from 'luxon';
import { MaybePromise } from 'lib';

interface Token {
  message: SiweMessage;
  signature: string;
}

const parseToken = (token: string): Token => {
  const { message, signature }: Token = JSON.parse(token);
  return { message: new SiweMessage(message), signature };
};

const isLocalPlayground = (req: Request) =>
  req.headers.origin?.endsWith(`[::1]:${CONFIG.api.port}`);

const isIntrospection = (req: Request) => req.body?.operationName === 'IntrospectionQuery';

type IsErrorCheck = (params: {
  msg: SiweMessage;
  sig: string;
  req: Request;
}) => MaybePromise<unknown>;

const checks: Record<string, IsErrorCheck> = {
  'Session lacking nonce': ({ req }) => req.session.nonce === undefined,
  "Message doesn't match signature": ({ msg, sig }) => !msg.validate(sig),
  "Message nonce doesn't match session nonce": ({ msg, req }) => msg.nonce !== req.session.nonce,
  'Message has expired': ({ msg }) =>
    msg.expirationTime && DateTime.fromISO(msg.expirationTime) <= DateTime.now(),
  'Message not yet valid': ({ msg }) =>
    msg.notBefore && DateTime.fromISO(msg.notBefore) > DateTime.now(),
};

export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (token) {
      const { message, signature } = parseToken(token);

      for (const [errorMessage, isError] of Object.entries(checks)) {
        if (await isError({ msg: message, sig: signature, req })) {
          console.log(`Throwing: ${errorMessage}`);
          throw new UnauthorizedException(errorMessage);
        }
      }

      req.userMessage = message;
    } else if (IS_DEV && isLocalPlayground(req) && !isIntrospection(req)) {
      req.userMessage = new SiweMessage({
        address: CONFIG.wallet.address,
      });
    }

    next();
  }
}
