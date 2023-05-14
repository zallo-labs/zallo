import { Injectable } from '@nestjs/common';
import { Address } from 'lib';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { getUserCtx } from '~/request/ctx';
import { DatabaseService } from '../database/database.service';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import e from '~/edgeql-js';
import { selectUser } from '../users/users.service';

interface AddUserAccountParams {
  user: Address;
  account: uuid;
}

@Injectable()
export class UserAccountsService {
  constructor(@InjectRedis() private redis: Redis, private db: DatabaseService) {}

  private readonly DAY_IN_SECONDS = 60 * 60 * 24;

  async add({ user, account }: AddUserAccountParams) {
    const accounts = (await this.getUserAccountsFromCache(user)) ?? [];

    accounts.push(account);
    getUserCtx().accounts.push(account);

    await this.setUserAccountsCache(user, accounts);
  }

  async get(user: Address): Promise<uuid[]> {
    const existingAccountsCache = await this.getUserAccountsFromCache(user);
    if (existingAccountsCache) return existingAccountsCache;

    const userId = await this.db.query(selectUser(user));
    if (!userId) return [];

    const accounts = await this.db.query(
      e.select(e.Account, (acc) => ({
        filter: e.op(
          e.uuid(userId.id),
          'in',
          e.set(acc.policies.state.approvers.id, acc.policies.draft.approvers.id),
        ),
      })).id,
    );

    this.setUserAccountsCache(user, accounts);

    return accounts;
  }

  private async getUserAccountsFromCache(user: Address) {
    const json = await this.redis.get(`user:${user}:accounts`);
    return json ? (JSON.parse(json) as uuid[]) : null;
  }

  private async setUserAccountsCache(user: Address, accounts: uuid[]) {
    const key = `user:${user}:accounts`;
    return this.redis.set(key, JSON.stringify(accounts), 'EX', this.DAY_IN_SECONDS);
  }
}
