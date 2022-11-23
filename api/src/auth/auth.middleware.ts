import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ethers, Wallet } from 'ethers';
import { Request, Response, NextFunction } from 'express';
import { address, AuthToken } from 'lib';
import { SiweMessage } from 'siwe';
import { CONFIG } from '~/config';
import { ProviderService } from '~/provider/provider.service';
import { VALIDATION_CHECKS } from './message.validation';

const AUTH_MESSAGE = CONFIG.graphRef && `AUTH ${CONFIG.graphRef}`;
const SIGNATURE_PATTERN = /^0x[0-9a-f]{130}$/i;

const tryParseAuth = (token?: string): AuthToken | string | undefined => {
  if (typeof token !== 'string') return undefined;

  try {
    const { message, ...rest }: AuthToken = JSON.parse(token);
    return { message: new SiweMessage(message), ...rest };
  } catch {
    if (SIGNATURE_PATTERN.test(token)) return token;
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
    // Auth may be an AuthToken (SIWE), a signed message or from a playground
    const auth = tryParseAuth(req.headers.authorization);

    if (typeof auth === 'object') {
      const { message, signature } = auth;

      for (const [fallbackErr, isError] of Object.entries(VALIDATION_CHECKS)) {
        const r = await isError({ msg: message, sig: signature, req, provider: this.provider });
        if (r) throw new UnauthorizedException(typeof r === 'string' ? r : fallbackErr);
      }

      // Use the session expiry time if provided
      if (message.expirationTime) req.session.cookie.expires = new Date(message.expirationTime);

      req.device = address(message.address);
    } else if (typeof auth === 'string' && AUTH_MESSAGE) {
      try {
        req.device = address(ethers.utils.verifyMessage(AUTH_MESSAGE, auth));
      } catch {
        throw new UnauthorizedException(
          `Invalid signature; required auth message: ${AUTH_MESSAGE}`,
        );
      }
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
