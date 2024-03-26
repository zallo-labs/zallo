import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Address, Hex, asAddress, isHex } from 'lib';
import { SiweMessage } from 'siwe';
import { CONFIG } from '~/config';
import { AccountsCacheService } from './accounts.cache.service';
import { Result, err, ok } from 'neverthrow';
import { recoverMessageAddress } from 'viem';
import { z } from 'zod';
import { P, match } from 'ts-pattern';
import { DateTime, DurationLike } from 'luxon';

const GRAPH_REF_AUTH_MESSAGE = CONFIG.graphRef && `AUTH ${CONFIG.graphRef}`;
const DEFAULT_CACHE_EXPIRY: DurationLike = { minutes: 30 };

const bearerString = z.string().transform((v) => {
  if (v.startsWith('Bearer ')) v = v.slice(7);
  return v;
});

const tokenScheme = z.union([
  bearerString.refine(isHex),
  bearerString.transform((v, ctx) => {
    try {
      const { message, signature } = JSON.parse(v);
      if (!isHex(signature)) {
        ctx.addIssue({ code: 'custom', message: 'Signature must be a hex string' });
        return z.NEVER;
      }

      return { message: new SiweMessage(message), signature: signature as Hex };
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid SIWE message; see https://login.xyz/' });
      return z.NEVER;
    }
  }),
]);

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private cache: Map<string, { address: Address; expirationTime: DateTime }> = new Map();

  constructor(private accountsCache: AccountsCacheService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    (await this.tryAuthenticate(req)).match(
      async (address) => {
        if (address) {
          req.user = await this.accountsCache.getApproverCtx(address);
        }
        next();
      },
      async (err) => next(new UnauthorizedException(err)),
    );
  }

  private async tryAuthenticate(req: Request): Promise<Result<Address | undefined, string>> {
    const token = req.headers.authorization;
    if (!token) return ok(undefined);

    // TODO: cache [token, headers.host]
    const cached = token && this.cache.get(token);
    if (cached) {
      if (cached.expirationTime > DateTime.now()) {
        return ok(cached.address);
      } else {
        this.cache.delete(token);
      }
    }

    const result = tokenScheme.safeParse(token);
    if (!result.success) return ok(undefined);

    return await match(result.data)
      .with(P.string, async (signature) => {
        if (!GRAPH_REF_AUTH_MESSAGE)
          return err('API is not configured to receive graph ref auth messages. Please use SIWE');

        try {
          const address = asAddress(
            await recoverMessageAddress({ message: GRAPH_REF_AUTH_MESSAGE, signature }),
          );

          this.cache.set(token, {
            address,
            expirationTime: DateTime.now().plus(DEFAULT_CACHE_EXPIRY),
          });

          return ok(address);
        } catch {
          return err(
            `Invalid signature; signature must be for message "${GRAPH_REF_AUTH_MESSAGE}"`,
          );
        }
      })
      .otherwise(async ({ message, signature }) => {
        const r = await message.verify(
          {
            signature,
            domain: req.headers.host,
            nonce: req.session?.nonce ?? 'nonceless',
          },
          { suppressExceptions: true },
        );

        if (r.error) return err(r.error.type);

        if (r.data.nonce === 'nonceless' && !r.data.expirationTime)
          return err('Nonce may only be omitted if expiration time is set');

        // Use the session expiry time if provided
        if (message.expirationTime) req.session.cookie.expires = new Date(message.expirationTime);

        const address = asAddress(message.address);
        this.cache.set(token, {
          address,
          expirationTime: message.expirationTime
            ? DateTime.fromISO(message.expirationTime)
            : DateTime.now().plus(DEFAULT_CACHE_EXPIRY),
        });

        return ok(address);
      });
  }
}
