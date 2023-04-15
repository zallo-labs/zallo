import { Injectable } from '@nestjs/common';
import { asAddress, Address } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { getUserCtx } from '~/request/ctx';

interface AddUserAccountParams {
  user: Address;
  account: Address;
}

@Injectable()
export class UserAccountsService {
  constructor(private prisma: PrismaService, @InjectRedis() private readonly redis: Redis) {}

  private readonly DAY_IN_SECONDS = 60 * 60 * 24;

  async add({ user, account }: AddUserAccountParams) {
    const accounts = (await this.getUserAccountsFromCache(user)) ?? new Set();
    await this.setUserAccountsCache(user, accounts.add(account));

    // Add to request context
    getUserCtx().accounts.add(account);
  }

  async get(user: Address) {
    const existingAccountsCache = await this.getUserAccountsFromCache(user);
    if (existingAccountsCache) return existingAccountsCache;

    const r = await this.prisma.asSystem.approver.findMany({
      where: {
        userId: user,
        state: {
          OR: [{ activeOf: {} }, { draftOf: {} }],
        },
      },
      select: { state: { select: { accountId: true } } },
    });

    const accounts = new Set([...r.map((r) => asAddress(r.state.accountId))]);
    await this.setUserAccountsCache(user, accounts);

    return accounts;
  }

  private async getUserAccountsFromCache(user: Address) {
    const json = await this.redis.get(`user:${user}:accounts`);
    return json ? new Set<Address>(JSON.parse(json)) : null;
  }

  private async setUserAccountsCache(user: Address, accounts: Set<Address>) {
    const key = `user:${user}:accounts`;
    return this.redis.set(key, JSON.stringify([...accounts]), 'EX', this.DAY_IN_SECONDS);
  }
}
