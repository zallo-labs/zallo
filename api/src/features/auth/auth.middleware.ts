import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { Address, asAddress } from 'lib';
import { DateTime } from 'luxon';
import { SiweMessage } from 'siwe';
import { CONFIG } from '~/config';
import { ProviderService } from '~/features/util/provider/provider.service';
import { AccountsCacheService } from './accounts.cache.service';
import { Result, err, ok } from 'neverthrow';

interface AuthToken {
  message: SiweMessage;
  signature: string;
}

const AUTH_MESSAGE = CONFIG.graphRef && `AUTH ${CONFIG.graphRef}`;
const SIGNATURE_PATTERN = /^0x[0-9a-f]{130}$/i;

const tryParseAuth = (token?: string): AuthToken | string | undefined => {
  if (typeof token !== 'string') return undefined;

  if (token.startsWith('Bearer ')) token = token.slice(7);

  try {
    const { message, signature } = JSON.parse(token) as AuthToken;
    return { message: new SiweMessage(message), signature };
  } catch {
    if (SIGNATURE_PATTERN.test(token)) return token;
  }
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private cache: Map<string, { address: Address; expirationTime?: number }> = new Map();

  constructor(
    private provider: ProviderService,
    private accountsCache: AccountsCacheService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    (await this.tryAuthenticate(req)).match(
      async (address) => {
        if (address)
          req.user = {
            approver: address,
            accounts: await this.accountsCache.getApproverAccounts(address),
          };
        next();
      },
      async (err) => next(new UnauthorizedException(err)),
    );
  }

  private async tryAuthenticate(req: Request): Promise<Result<Address | undefined, string>> {
    const token = req.headers.authorization;
    if (!token) return ok(undefined);

    const cached = token && this.cache.get(token);
    if (cached) {
      if (!cached.expirationTime || cached.expirationTime > Date.now()) {
        return ok(cached.address);
      } else {
        this.cache.delete(token);
      }
    }

    const auth = tryParseAuth(token);
    if (typeof auth === 'object') {
      const { message, signature } = auth;

      const validationError = await (async () => {
        try {
          const r = await message.validate(signature, this.provider);

          // Allow for nonceless authentication if expiration time is set; note that the standard mandates that `nonce` is set
          if (r.nonce === 'nonceless') {
            if (!r.expirationTime) return 'Nonce may only be omitted if expiration time is set';
          } else if (!req.session?.nonce) {
            return 'Session lacking nonce; make sure cookies are being included';
          } else if (req.session.nonce !== r.nonce) {
            return "Nonce doesn't match session nonce";
          }

          const host = req.headers.host;
          if (host && r.domain !== host) return 'Invalid domain (host)';

          if (r.expirationTime && DateTime.fromISO(r.expirationTime) < DateTime.now())
            return 'Expired';

          if (r.notBefore && DateTime.fromISO(r.notBefore) > DateTime.now()) return 'Not yet valid';

          return false;
        } catch (e) {
          return (e as Error).message;
        }
      })();

      if (validationError) return err(validationError);

      // Use the session expiry time if provided
      if (message.expirationTime) req.session.cookie.expires = new Date(message.expirationTime);

      return ok(asAddress(message.address));
    } else if (typeof auth === 'string' && AUTH_MESSAGE) {
      try {
        return ok(asAddress(ethers.utils.verifyMessage(AUTH_MESSAGE, auth)));
      } catch {
        return err(`Invalid signature; required auth message: ${AUTH_MESSAGE}`);
      }
    }

    return ok(undefined);
  }
}
