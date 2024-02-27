import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { UpdateUserInput } from './users.input';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { randomBytes } from 'crypto';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { UserInputError } from '@nestjs/apollo';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { Address, UUID } from 'lib';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { getUserCtx } from '~/request/ctx';
import { selectAccount } from '~/features/accounts/accounts.util';

export interface UserSubscriptionPayload {}
const getUserTrigger = (user: uuid) => `user.${user}`;
const getUserApproverTrigger = (approver: Address) => `user.approver.${approver}`;

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
    return this.db.query(
      e.update(e.global.current_user, () => ({
        set: { primaryAccount: primaryAccount && selectAccount(primaryAccount) },
      })),
    );
  }

  async subscribeToUser() {
    const user = await this.db.query(
      e.assert_exists(e.select(e.global.current_user, () => ({ id: true }))).id,
    );

    return this.pubsub.asyncIterator([
      getUserTrigger(user),
      getUserApproverTrigger(getUserCtx().approver),
    ]);
  }

  async getLinkingToken(user: UUID) {
    const key = this.getLinkingTokenKey(user);
    const newSecret = randomBytes(32).toString('base64');

    const secret = (await this.redis.set(key, newSecret, 'NX', 'GET')) ?? newSecret;
    this.redis.expire(key, 60 * 60 /* 1 hour */);

    return `${user}:${secret}`;
  }

  async link(token: string) {
    const [oldId, secret] = token.split(':');

    const expectedSecret = await this.redis.get(this.getLinkingTokenKey(oldId));
    if (secret !== expectedSecret)
      throw new UserInputError(`Invalid linking token; token may have expired (1h)`);

    const newId = await this.db.query(e.assert_exists(e.select(e.global.current_user.id)));
    if (oldId === newId) return;

    const approvers = await this.db.DANGEROUS_superuserClient.transaction(async (db) => {
      const oldUser = e.select(e.User, () => ({ filter_single: { id: oldId } }));
      const newUser = e.select(e.User, () => ({ filter_single: { id: newId } }));

      // Merge old user into new user (avoiding exclusivity constraint violations)
      const { approvers } = await e
        .select({
          approvers: e.update(oldUser.approvers, () => ({ set: { user: newUser } })).address,
          contacts: e.update(oldUser.contacts, (c) => ({
            filter: e.op(c.label, 'not in', newUser.contacts.label),
            set: { user: newUser },
          })),
        })
        .run(db);

      // Delete old user
      await e.delete(oldUser).run(db);

      return approvers;
    });

    // Remove approver -> user cache
    await this.accountsCache.invalidateApproverUserAccountsCache(...(approvers as Address[]));
    await Promise.all([
      this.pubsub.publish<UserSubscriptionPayload>(getUserTrigger(newId), {}),
      ...approvers.map((approver) =>
        this.pubsub.publish<UserSubscriptionPayload>(
          getUserApproverTrigger(approver as Address),
          {},
        ),
      ),
    ]);

    // Remove user -> accounts cache for both old & new user
    await this.accountsCache.removeUserAccountsCache(oldId, newId);

    // Remove token
    await this.redis.del(this.getLinkingTokenKey(oldId));
  }

  private getLinkingTokenKey(user: uuid) {
    return `linking-token:${user}`;
  }
}
