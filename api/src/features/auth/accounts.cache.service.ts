import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Address, UAddress, asUAddress, isPresent } from 'lib';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { UserAccountContext, getUserCtx } from '~/request/ctx';
import { DatabaseService } from '../database/database.service';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import e from '~/edgeql-js';
import { Duration } from 'luxon';

interface AdApproverToAccountParams {
  approver: Address;
  account: UserAccountContext;
}

const ACCOUNTS_ADDRESS_SET = 'accounts';
const approverUserKey = (approver: Address) => `approver:${approver}:user`;
const userAccountsKey = (user: uuid) => `user:${user}:accounts`;

@Injectable()
export class AccountsCacheService implements OnModuleInit {
  private readonly EXPIRY_SECONDS = Duration.fromObject({ day: 1 }).as('seconds');

  constructor(
    @InjectRedis() private redis: Redis,
    private db: DatabaseService,
  ) {}

  async onModuleInit() {
    if ((await this.redis.scard(ACCOUNTS_ADDRESS_SET)) > 0) return;

    const addresses = await this.db.query(e.select(e.Account, () => ({ address: true })).address);
    if (addresses.length) await this.redis.sadd(ACCOUNTS_ADDRESS_SET, addresses);
  }

  async isAccount<T extends UAddress | UAddress[]>(address: T) {
    return (
      Array.isArray(address)
        ? (await this.redis.smismember(ACCOUNTS_ADDRESS_SET, ...address)).map((r) => r === 1)
        : (await this.redis.sismember(ACCOUNTS_ADDRESS_SET, address)) === 1
    ) as T extends Address[] ? boolean[] : boolean;
  }

  async getApproverAccounts(approver: Address): Promise<UserAccountContext[]> {
    const cachedAccounts = await this.getCachedAccounts(approver);
    if (cachedAccounts) return cachedAccounts;

    const { user } = await this.db.query(
      e.select(
        e.insert(e.Approver, { address: approver }).unlessConflict((a) => ({
          on: a.address,
          else: a,
        })),
        () => ({
          user: {
            id: true,
            accounts: { id: true, address: true },
          },
        }),
      ),
    );

    const accounts = user.accounts.map(
      (a): UserAccountContext => ({ id: a.id, address: asUAddress(a.address) }),
    );

    await this.setCachedAccounts(user.id, approver, accounts);

    return accounts;
  }

  async addCachedAccount({ approver, account }: AdApproverToAccountParams) {
    this.redis.sadd(ACCOUNTS_ADDRESS_SET, account.address);

    const accounts = await this.getApproverAccounts(approver);
    if (!accounts.find((a) => a.id === account.id)) accounts.push(account);
    if (!getUserCtx().accounts.find((a) => a.id === account.id))
      getUserCtx().accounts.push(account);

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

  async removeApproverUserCache(...approvers: Address[]) {
    await this.redis.del(...approvers.map(approverUserKey));
  }

  async removeUserAccountsCache(...users: uuid[]) {
    await this.redis.del(...users.map(userAccountsKey));
  }

  async invalidateApproverUserAccountsCache(...approvers: Address[]) {
    if (!approvers.length) return;
    const users = (await this.redis.mget(...approvers.map(approverUserKey))).filter(isPresent);
    await this.redis.del(...users.map(userAccountsKey));
  }

  private async getCachedAccounts(approver: Address): Promise<UserAccountContext[] | null> {
    const user = await this.redis.get(approverUserKey(approver));
    if (!user) return null;

    const json = await this.redis.get(userAccountsKey(user));
    return json ? (JSON.parse(json) as UserAccountContext[]) : null;
  }

  private async setCachedAccounts(user: uuid, approver: Address, accounts: UserAccountContext[]) {
    await Promise.all([
      this.redis.set(approverUserKey(approver), user, 'EX', this.EXPIRY_SECONDS),
      this.redis.set(userAccountsKey(user), JSON.stringify(accounts), 'EX', this.EXPIRY_SECONDS),
    ]);
  }
}
