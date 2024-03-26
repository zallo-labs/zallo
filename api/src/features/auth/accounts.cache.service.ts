import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Address, UAddress, UUID, asAddress, asUAddress, isPresent } from 'lib';
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
const userApproversKey = (user: uuid) => `user:${user}:approvers`; // user -> approver[]
const approverAccountsKey = (approver: Address) => `approver:${approver}:accounts`; // approver -> account[]
const approverUserKey = (approver: Address) => `approver:${approver}:user`; // approver -> user

@Injectable()
export class AccountsCacheService implements OnModuleInit {
  private readonly EXPIRY_SECONDS = Duration.fromObject({ day: 1 }).as('seconds');
  private log = new Logger(this.constructor.name);

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
    ) as T extends unknown[] ? boolean[] : boolean;
  }

  async getApproverCtx(approver: Address) {
    const [cachedUserId, cachedAccounts] = await this.redis.mget(
      approverUserKey(approver),
      approverAccountsKey(approver),
    );
    if (cachedUserId && cachedAccounts)
      return {
        id: cachedUserId as UUID,
        approver,
        accounts: JSON.parse(cachedAccounts) as UserAccountContext[],
      };

    const { user } = await this.db.query(
      e.select(
        e.insert(e.Approver, { address: approver }).unlessConflict((a) => ({
          on: a.address,
          else: a,
        })),
        () => ({
          user: {
            id: true,
            approvers: { address: true },
            accounts: { id: true, address: true },
          },
        }),
      ),
    );

    const accounts = user.accounts.map(
      (a): UserAccountContext => ({ id: a.id, address: asUAddress(a.address) }),
    );

    await this.setCachedAccounts(
      user.id,
      accounts,
      user.approvers.map((a) => asAddress(a.address)),
    );

    return { id: user.id as UUID, approver, accounts };
  }

  async getApproverAccounts(approver: Address) {
    return (await this.getApproverCtx(approver)).accounts;
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
      await this.setCachedAccounts(user, accounts);
    } else {
      this.log.error(`No user found for approver ${approver}`);
    }
  }

  async invalidateUsersCache(...users: uuid[]) {
    const userApprovers = await Promise.all(
      [...new Set(users)].map(async (user) => {
        const json = await this.redis.get(userApproversKey(user));
        return json ? (JSON.parse(json) as Address[]) : [];
      }),
    );
    await this.redis.del(
      ...userApprovers.flat().map((approver) => approverAccountsKey(asAddress(approver))),
    );
  }

  async invalidateApproversCache(...approvers: Address[]) {
    if (!approvers.length) return;
    const users = (await this.redis.mget(...approvers.map(approverUserKey))).filter(isPresent);
    await this.invalidateUsersCache(...users);
  }

  private async setCachedAccounts(
    user: uuid,
    accounts: UserAccountContext[],
    approvers?: Address[],
  ) {
    approvers ??= JSON.parse((await this.redis.get(userApproversKey(user)))!) as Address[];

    await Promise.all([
      this.redis.set(userApproversKey(user), JSON.stringify(approvers), 'EX', this.EXPIRY_SECONDS),
      ...approvers.map((approver) =>
        this.redis.set(approverUserKey(approver), user, 'EX', this.EXPIRY_SECONDS),
      ),
      ...approvers.map((approver) =>
        this.redis.set(
          approverAccountsKey(approver),
          JSON.stringify(accounts),
          'EX',
          this.EXPIRY_SECONDS,
        ),
      ),
    ]);
  }
}
