import { Account } from '@gen/account/account.model';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  address,
  Address,
  deployAccountProxy,
  TokenLimit,
  TokenLimitPeriod,
  toDeploySalt,
  toQuorumKey,
} from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { ProviderService } from '~/features/util/provider/provider.service';
import { BigNumber } from 'ethers';
import { PubsubService } from '../util/pubsub/pubsub.service';
import assert from 'assert';
import { AccountSubscriptionPayload, ACCOUNT_SUBSCRIPTION } from './accounts.args';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private pubsub: PubsubService,
  ) {}

  async accounts(user: Address, args: Prisma.AccountFindManyArgs = {}): Promise<Account[]> {
    return this.prisma.account.findMany({
      ...args,
      where: {
        AND: [
          {
            quorumStates: {
              some: {
                approvers: { some: { userId: user } },
                isRemoved: false,
              },
            },
          },
          args.where ?? {},
        ],
      },
    });
  }

  async activateAccount<T extends Pick<Prisma.AccountUpdateArgs, 'select'>>(
    accountAddr: Address,
    updateArgs?: T,
  ) {
    const { impl, deploySalt, isActive, quorumStates } =
      await this.prisma.account.findUniqueOrThrow({
        where: { id: accountAddr },
        select: {
          impl: true,
          deploySalt: true,
          isActive: true,
          // Initialization quorums
          quorumStates: {
            where: { proposal: null },
            include: {
              approvers: true,
              limits: true,
            },
          },
        },
      });
    assert(!isActive);

    // Activate
    const r = await this.provider.useProxyFactory((factory) =>
      deployAccountProxy(
        {
          impl: address(impl),
          quorums: quorumStates.map((q) => ({
            key: toQuorumKey(q.quorumKey),
            approvers: new Set(q.approvers.map((a) => address(a.userId))),
            spending: {
              fallback: q.spendingFallback,
              limits: Object.fromEntries(
                q.limits.map((l): [Address, TokenLimit] => [
                  address(l.token),
                  {
                    token: address(l.token),
                    amount: BigNumber.from(l.amount),
                    period: l.period as TokenLimitPeriod,
                  },
                ]),
              ),
            },
          })),
        },
        factory,
        toDeploySalt(deploySalt),
      ),
    );
    await r.account.deployed();

    return this.prisma.account.update({
      where: { id: accountAddr },
      data: {
        isActive: true,
        quorums: {
          update: quorumStates.map((state) => ({
            where: {
              accountId_key: {
                accountId: state.accountId,
                key: state.quorumKey,
              },
            },
            data: {
              activeStateId: state.id,
            },
          })),
        },
      },
      ...updateArgs,
    }) as Prisma.Prisma__AccountClient<Prisma.AccountGetPayload<T>>;
  }

  publishAccount(payload: AccountSubscriptionPayload) {
    return this.pubsub.publish<AccountSubscriptionPayload>(ACCOUNT_SUBSCRIPTION, payload);
  }
}
