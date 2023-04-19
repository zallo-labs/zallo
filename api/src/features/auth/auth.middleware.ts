import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ethers, Wallet } from 'ethers';
import { Address, asAddress } from 'lib';
import { DateTime } from 'luxon';
import { SiweMessage } from 'siwe';
import { CONFIG } from '~/config';
import { ProviderService } from '~/features/util/provider/provider.service';
import { UserAccountsService } from './userAccounts.service';

interface AuthToken {
  message: SiweMessage;
  signature: string;
}

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
  constructor(private provider: ProviderService, private userAccount: UserAccountsService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = await this.tryAuthenticate(req);
    if (user) req.user = { id: user, accounts: await this.userAccount.get(user) };

    next();
  }

  private async tryAuthenticate(req: Request): Promise<Address | undefined> {
    const auth = tryParseAuth(req.headers.authorization);

    if (typeof auth === 'object') {
      const { message, signature } = auth;

      const validationError = await (async () => {
        if (req.session.nonce === undefined) return 'Session lacking nonce';

        try {
          const r = await message.validate(signature, this.provider);

          const host = req.headers.host;
          if (host && r.domain !== host) return 'Invalid domain (host)';
          if (r.nonce !== req.session.nonce) return 'Invalid nonce';
          if (r.expirationTime && DateTime.fromISO(r.expirationTime) < DateTime.now())
            return 'Expired';
          if (r.notBefore && DateTime.fromISO(r.notBefore) > DateTime.now()) return 'Not yet valid';

          return false;
        } catch (e) {
          return (e as Error).message;
        }
      })();

      if (validationError) throw new UnauthorizedException(validationError);

      // Use the session expiry time if provided
      if (message.expirationTime) req.session.cookie.expires = new Date(message.expirationTime);

      return asAddress(message.address);
    } else if (typeof auth === 'string' && AUTH_MESSAGE) {
      try {
        return asAddress(ethers.utils.verifyMessage(AUTH_MESSAGE, auth));
      } catch {
        throw new UnauthorizedException(
          `Invalid signature; required auth message: ${AUTH_MESSAGE}`,
        );
      }
    } else if (isPlayground(req)) {
      req.session.playgroundWallet ??= asAddress(Wallet.createRandom().address);

      return req.session.playgroundWallet;
    }
  }
}
