import { Injectable } from '@nestjs/common';
import { Address } from 'lib';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { getUserCtx } from '~/request/ctx';
import { DatabaseService } from '../database/database.service';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import e from '~/edgeql-js';

interface AddUserAccountParams {
  user: Address;
  account: uuid;
}

@Injectable()
export class UserAccountsService {
  constructor(@InjectRedis() private redis: Redis, private db: DatabaseService) {}

  private readonly DAY_IN_SECONDS = 60 * 60 * 24;

  async add({ user, account }: AddUserAccountParams) {
    const accounts = (await this.getUserAccountsFromCache(user)) ?? new Set();
    await this.setUserAccountsCache(user, accounts.add(account));

    // Add to request context
    getUserCtx().accounts.add(account);
  }

  async get(user: Address): Promise<Set<uuid>> {
    const existingAccountsCache = await this.getUserAccountsFromCache(user);
    if (existingAccountsCache) return existingAccountsCache;

    const selectId = e.select(e.User, () => ({
      filter_single: { address: user },
    }));

    const userId = await this.db.query(selectId);
    if (!userId) return new Set();

    const accountsQuery = e.select(e.Account, (acc) => ({
      filter: e.op(
        e.uuid(userId.id),
        'in',
        e.set(acc.policies.state.approvers.id, acc.policies.draft.approvers.id),
      ),
    }));

    const accounts = new Set<uuid>((await this.db.query(accountsQuery)).map(({ id }) => id));
    this.setUserAccountsCache(user, accounts);

    return accounts;
  }

  private async getUserAccountsFromCache(user: Address) {
    const json = await this.redis.get(`user:${user}:accounts`);
    return json ? new Set<uuid>(JSON.parse(json)) : null;
  }

  private async setUserAccountsCache(user: Address, accounts: Set<uuid>) {
    const key = `user:${user}:accounts`;
    return this.redis.set(key, JSON.stringify([...accounts]), 'EX', this.DAY_IN_SECONDS);
  }
}
