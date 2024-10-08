import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/core/database';
import { ShapeFunc } from '~/core/database';
import e from '~/edgeql-js';
import { UpdateUserInput } from './users.input';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { randomBytes } from 'crypto';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { UserInputError } from '@nestjs/apollo';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { Address, asAddress } from 'lib';
import { EventPayload, PubsubService } from '~/core/pubsub/pubsub.service';
import { getUserCtx } from '~/core/context';

const TOKEN_EXPIRY_S = 60 * 60; // 1 hour

export interface UserLinkedPayload extends EventPayload<'linked'> {
  issuer: Address;
  linker: Address;
}
const userLinkedTrigger = (user: uuid) => `user.linked:${user}`;

@Injectable()
export class UsersService {
  constructor(
    private db: DatabaseService,
    @InjectRedis()
    private redis: Redis,
    private pubsub: PubsubService,
    private accountsCache: AccountsCacheService,
  ) {}

  async selectUnique(shape?: ShapeFunc<typeof e.global.current_user>) {
    return this.db.query(
      e.select(e.global.current_user, (u) => ({
        ...shape?.(u),
      })),
    );
  }

  async update({ primaryAccount }: UpdateUserInput) {
    return this.db.queryWith(
      { primaryAccount: e.optional(e.UAddress) },
      ({ primaryAccount }) =>
        e.update(e.global.current_user, () => ({
          set: {
            primaryAccount: e.select(e.Account, () => ({
              filter_single: { address: primaryAccount },
            })),
          },
        })),
      { primaryAccount },
    );
  }

  async subscribeToUser() {
    const user = await this.db.query(e.assert_exists(e.select(e.global.current_user.id)));

    return this.pubsub.asyncIterator(userLinkedTrigger(user));
  }

  async generateLinkingToken() {
    const issuer = getUserCtx().approver;
    const key = this.getLinkingTokenKey(issuer);
    const newSecret = randomBytes(16).toString('base64');

    const z = await this.redis
      .multi()
      .set(key, newSecret, 'NX', 'GET') // get if exists or set if not
      .expire(key, TOKEN_EXPIRY_S) // resets expiry
      .exec();
    if (!z) throw new Error('Failed to generate linking token');
    const secret = z[0][1] ?? newSecret;

    return `${issuer}:${secret}`;
  }

  async link(token: string) {
    const [issuerStr, secret] = token.split(':');
    const issuer = asAddress(issuerStr);

    const expectedSecret = await this.redis.get(this.getLinkingTokenKey(issuer));
    if (!expectedSecret) throw new UserInputError(`Linking token not found; it expires after 1h`);
    if (secret !== expectedSecret) throw new UserInputError('Wrong linking token');

    const linkerUserId = getUserCtx().id;
    const { issuerUser, issuerApprovers } = await this.db.DANGEROUS_superuserClient.transaction(
      async (db) => {
        const selectSrcApprover = e.select(e.Approver, () => ({
          filter_single: { address: issuer },
        }));
        const issuerUser = e.assert_single(
          e.select(selectSrcApprover.user, (u) => ({
            filter: e.op(u.id, '!=', e.uuid(linkerUserId)),
          })),
        );
        const linkerUser = e.select(e.User, () => ({ filter_single: { id: linkerUserId } }));

        // Merge issuer into linker (avoiding exclusivity constraint violations)
        const r = await e
          .select({
            issuerUser: issuerUser.id,
            issuerApprovers: e.update(issuerUser.approvers, () => ({ set: { user: linkerUser } }))
              .address,
            contacts: e.update(issuerUser.contacts, (c) => ({
              filter: e.op(c.name, 'not in', linkerUser.contacts.name),
              set: { user: linkerUser },
            })),
          })
          .run(db);

        // Delete old issuer user
        if (r.issuerUser) await e.delete(issuerUser).run(db);

        return r;
      },
    );

    const payload: UserLinkedPayload = { event: 'linked', issuer, linker: getUserCtx().approver };
    this.pubsub.event<UserLinkedPayload>(userLinkedTrigger(linkerUserId), payload);
    if (issuerUser) {
      this.pubsub.event<UserLinkedPayload>(userLinkedTrigger(issuerUser), payload);

      this.accountsCache.invalidateApproversCache(...(issuerApprovers as Address[]));
      this.accountsCache.invalidateUsersCache(issuerUser, linkerUserId);
    }

    await this.redis.del(this.getLinkingTokenKey(issuer));
  }

  private getLinkingTokenKey(issuer: Address) {
    return `link:${issuer}`;
  }
}
