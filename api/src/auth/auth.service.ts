import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ethers, Wallet } from 'ethers';
import { Request } from 'express';
import { AuthToken, address } from 'lib';
import { DateTime } from 'luxon';
import { SiweMessage } from 'siwe';
import { CONFIG } from '~/config';
import { ProviderService } from '~/provider/provider.service';
import { UserContext } from '~/request/ctx';

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
export class AuthService {
  constructor(private provider: ProviderService) {}

  async tryAuth(req: Request): Promise<UserContext | undefined> {
    const auth = tryParseAuth(req.headers.authorization);

    if (typeof auth === 'object') {
      const { message, signature } = auth;

      for (const [fallbackErr, isError] of Object.entries({
        'Session lacking nonce': () => req.session.nonce === undefined,
        'Message verification failed': async () => {
          const r = await message.verify(
            {
              signature,
              domain: new URL(req.hostname).host,
              nonce: req.session.nonce,
              time: DateTime.now().toISO(),
            },
            { provider: this.provider },
          );

          return r.error?.type || false;
        },
      })) {
        const r = await isError();
        if (r) throw new UnauthorizedException(typeof r === 'string' ? r : fallbackErr);
      }

      // Use the session expiry time if provided
      if (message.expirationTime) req.session.cookie.expires = new Date(message.expirationTime);

      return { id: address(message.address) };
    } else if (typeof auth === 'string' && AUTH_MESSAGE) {
      try {
        return { id: address(ethers.utils.verifyMessage(AUTH_MESSAGE, auth)) };
      } catch {
        throw new UnauthorizedException(
          `Invalid signature; required auth message: ${AUTH_MESSAGE}`,
        );
      }
    } else if (isPlayground(req)) {
      return {
        id:
          req.session.playgroundWallet ||
          (req.session.playgroundWallet = address(Wallet.createRandom().address)),
      };
    }
  }
}
