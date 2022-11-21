import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Wallet } from 'ethers';
import { Request, Response, NextFunction } from 'express';
import { address, AuthToken } from 'lib';
import { SiweMessage } from 'siwe';
import { ProviderService } from '~/provider/provider.service';
import { VALIDATION_CHECKS } from './message.validation';

const tryParseToken = (token?: string): AuthToken | undefined => {
  try {
    if (token) {
      const { message, ...rest }: AuthToken = JSON.parse(token);
      return { message: new SiweMessage(message), ...rest };
    }
  } catch {
    // return undefined
  }
};

const PLAYGROUND_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '[::1]',
  'studio.apollographql.com',
  'zallo.io',
]);

const isPlayground = (req: Request) => {
  if (!req.headers.origin) return false;
  const hostname = new URL(req.headers.origin).hostname;

  return PLAYGROUND_HOSTS.has(hostname) || hostname.endsWith('.zallo.io');
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private provider: ProviderService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const token = tryParseToken(req.headers.authorization);
    if (token) {
      const { message, signature } = token;

      for (const [fallbackErr, isError] of Object.entries(VALIDATION_CHECKS)) {
        const r = await isError({ msg: message, sig: signature, req, provider: this.provider });
        if (r) throw new UnauthorizedException(typeof r === 'string' ? r : fallbackErr);
      }

      // Use the session expiry time if provided
      if (message.expirationTime) req.session.cookie.expires = new Date(message.expirationTime);

      req.device = address(message.address);
    } else if (isPlayground(req)) {
      if (!req.session.playgroundWallet) {
        req.session.playgroundWallet = address(Wallet.createRandom().address);

        // TODO: associate device with example data
      }

      req.device = req.session.playgroundWallet;
    }

    next();
  }
}
