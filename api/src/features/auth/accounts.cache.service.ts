import { Injectable, Logger } from '@nestjs/common';
import { Address } from 'lib';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { getUserCtx } from '~/request/ctx';
import { DatabaseService } from '../database/database.service';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import e from '~/edgeql-js';

interface AdApproverToAccountParams {
  approver: Address;
  account: uuid;
}

const approverUserKey = (approver: Address) => `approver:${approver}:user`;
const userAccountsKey = (user: uuid) => `user:${user}:accounts`;

@Injectable()
export class AccountsCacheService {
  constructor(@InjectRedis() private redis: Redis, private db: DatabaseService) {}

  private readonly DAY_IN_SECONDS = 60 * 60 * 24;

  async getApproverAccounts(approver: Address): Promise<uuid[]> {
    const cachedAccounts = await this.getCachedAccounts(approver);
    if (cachedAccounts) return cachedAccounts;

    const selectApprover = e.insert(e.Approver, { address: approver }).unlessConflict((a) => ({
      on: a.address,
      else: a,
    }));

    const a = await this.db.query(
      e.select(selectApprover, () => ({
        user: {
          id: true,
          accounts: true,
        },
      })),
    );

    const accounts = a?.user.accounts.map((a) => a.id) ?? [];
    if (a) await this.setCachedAccounts(a.user.id, approver, accounts);

    return accounts;
  }

  async addCachedAccount({ approver, account }: AdApproverToAccountParams) {
    const accounts = (await this.getCachedAccounts(approver)) ?? [];

    if (!accounts.includes(account)) accounts.push(account);
    if (!getUserCtx().accounts.includes(account)) getUserCtx().accounts.push(account);

    const user = await this.db.query(
      e.select(e.Approver, () => ({
        filter_single: { address: approver },
        user: { id: true },
      })).user.id,
    );

    if (user) {
      await this.setCachedAccounts(user, approver, accounts);
    } else {
      Logger.error(`No user found for approver ${approver}`);
    }
  }

  async removeCache(...approvers: Address[]) {
    await this.redis.del(...approvers.map(approverUserKey));
  }

  private async getCachedAccounts(approver: Address): Promise<uuid[] | null> {
    const user = await this.redis.get(approverUserKey(approver));
    if (!user) return null;

    const json = await this.redis.get(userAccountsKey(user));
    return json ? (JSON.parse(json) as uuid[]) : null;
  }

  private async setCachedAccounts(user: uuid, approver: Address, accounts: uuid[]) {
    await this.redis.set(approverUserKey(approver), user, 'EX', this.DAY_IN_SECONDS);
    await this.redis.set(
      userAccountsKey(user),
      JSON.stringify(accounts),
      'EX',
      this.DAY_IN_SECONDS,
    );
  }
}
