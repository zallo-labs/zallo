import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Address, asAddress, isHex } from 'lib';
import { CONFIG } from '~/config';
import { AccountsCacheService } from './accounts.cache.service';
import { Result, err, ok } from 'neverthrow';
import { recoverMessageAddress } from 'viem';
import { z } from 'zod';
import { P, match } from 'ts-pattern';
import { DateTime } from 'luxon';
import { getContext } from '#/util/context';
import { parseSiweMessage, validateSiweMessage } from 'viem/siwe';
import TTLCache from '@isaacs/ttlcache';

const GRAPH_REF_AUTH_MESSAGE = CONFIG.graphRef && `AUTH ${CONFIG.graphRef}`;

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

      return { message: message as string, fields: parseSiweMessage(message), signature };
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid SIWE message; see https://login.xyz/' });
      return z.NEVER;
    }
  }),
]);

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private cache = new TTLCache<string, Address>({
    ttl: 3600 /* 1 hour */,
    max: 10_000,
  });

  constructor(private accountsCache: AccountsCacheService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    (await this.tryAuthenticate(req)).match(
      async (address) => {
        if (address) {
          getContext().user = await this.accountsCache.getApproverCtx(address);
        }
        next();
      },
      async (err) => next(new UnauthorizedException(err)),
    );
  }

  private async tryAuthenticate(req: Request): Promise<Result<Address | undefined, string>> {
    const token = req.headers.authorization;
    if (!token) return ok(undefined);

    const key = `[${token},${req.headers.host}]`;
    const cached = this.cache.get(key);
    if (cached) return ok(cached);

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

          this.cache.set(key, address);

          return ok(address);
        } catch {
          return err(
            `Invalid signature; signature must be for message "${GRAPH_REF_AUTH_MESSAGE}"`,
          );
        }
      })
      .otherwise(async ({ message, fields, signature }) => {
        const address = asAddress(await recoverMessageAddress({ message, signature }));
        const success = validateSiweMessage({
          address,
          message: fields,
          domain: new URL(`http://${req.headers.host}`).host,
          nonce: req.session?.nonce ?? 'nonceless',
        });
        if (!success) return err('SIWE message verification failed');

        if (fields.nonce === 'nonceless' && !fields.expirationTime)
          return err('Nonceless may only be omitted if `expirationTime` is set');

        this.cache.set(key, address, {
          ttl: fields.expirationTime
            ? DateTime.fromJSDate(fields.expirationTime).diffNow().toMillis()
            : undefined,
        });

        return ok(address);
      });
  }
}
