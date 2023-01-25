import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ethers, Wallet } from 'ethers';
import { Request } from 'express';
import { Address, address } from 'lib';
import { DateTime } from 'luxon';
import { PrismaService } from 'nestjs-prisma';
import { SiweMessage } from 'siwe';
import { CONFIG } from '~/config';
import { ProviderService } from '~/features/util/provider/provider.service';
import { UserContext } from '~/request/ctx';

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
export class AuthService {
  constructor(private provider: ProviderService, private prisma: PrismaService) {}

  async tryAuth(req: Request): Promise<UserContext | undefined> {
    const id = await this.tryGetUserId(req);
    if (!id) return undefined;

    if (!req.session.accounts) req.session.accounts = await this.getAccounts(id);

    return { id, accounts: req.session.accounts };
  }

  private async tryGetUserId(req: Request): Promise<Address | undefined> {
    const auth = tryParseAuth(req.headers.authorization);

    if (typeof auth === 'object') {
      const { message, signature } = auth;

      const validationError = await (async () => {
        if (req.session.nonce === undefined) return 'Session lacking nonce';

        try {
          const r = await message.validate(signature, this.provider);

          if (r.domain !== req.get('host')) return 'Invalid domain (host)';
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

      return address(message.address);
    } else if (typeof auth === 'string' && AUTH_MESSAGE) {
      try {
        return address(ethers.utils.verifyMessage(AUTH_MESSAGE, auth));
      } catch {
        throw new UnauthorizedException(
          `Invalid signature; required auth message: ${AUTH_MESSAGE}`,
        );
      }
    } else if (isPlayground(req)) {
      if (!req.session.playgroundWallet)
        req.session.playgroundWallet = address(Wallet.createRandom().address);

      return req.session.playgroundWallet;
    }
  }

  private async getAccounts(userId: Address) {
    const accounts = await this.prisma.account.findMany({
      where: {
        quorumStates: {
          some: {
            approvers: {
              some: {
                userId,
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    return new Set(accounts.map((acc) => address(acc.id)));
  }
}
