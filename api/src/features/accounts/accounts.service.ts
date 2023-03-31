import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { asAddress, Address, deployAccountProxy, toDeploySalt } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProviderService } from '~/features/util/provider/provider.service';
import { PubsubService } from '../util/pubsub/pubsub.service';
import assert from 'assert';
import {
  AccountSubscriptionPayload,
  ACCOUNT_SUBSCRIPTION,
  USER_ACCOUNT_SUBSCRIPTION,
} from './accounts.args';
import { prismaAsPolicy } from '../policies/policies.util';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private pubsub: PubsubService,
  ) {}

  findUnique = this.prisma.asUser.account.findUnique;
  findMany = this.prisma.asUser.account.findMany;

  async activateAccount<T extends Pick<Prisma.AccountUpdateArgs, 'select'>>(
    accountAddr: Address,
    updateArgs?: T,
  ) {
    const {
      impl,
      deploySalt,
      isActive,
      policyRulesHistory: rules,
    } = await this.prisma.asUser.account.findUniqueOrThrow({
      where: { id: accountAddr },
      select: {
        impl: true,
        deploySalt: true,
        isActive: true,
        // Initialization rules
        policyRulesHistory: {
          where: { proposal: null },
          select: {
            id: true,
            policyKey: true,
            approvers: { select: { userId: true } },
            onlyFunctions: true,
            onlyTargets: true,
          },
        },
      },
    });
    assert(!isActive);

    // Activate
    const r = await this.provider.useProxyFactory((factory) =>
      deployAccountProxy(
        {
          impl: asAddress(impl),
          policies: rules.map(prismaAsPolicy),
        },
        factory,
        toDeploySalt(deploySalt),
      ),
    );
    await r.account.deployed();

    return this.prisma.asUser.account.update({
      where: { id: accountAddr },
      data: {
        isActive: true,
        policies: {
          update: rules.map((r) => ({
            where: { accountId_key: { accountId: accountAddr, key: r.policyKey } },
            data: { activeId: r.id, draftId: null },
          })),
        },
      },
      ...updateArgs,
    }) as Prisma.Prisma__AccountClient<Prisma.AccountGetPayload<T>>;
  }

  async publishAccount({ event, account: { id } }: AccountSubscriptionPayload) {
    const payload: AccountSubscriptionPayload = { event, account: { id } }; // Reconstruct to exclude other fields
    await this.pubsub.publish<AccountSubscriptionPayload>(`${ACCOUNT_SUBSCRIPTION}.${id}`, payload);

    // Publish event to all users with access to the account
    const { policyRulesHistory: rules } = await this.prisma.asUser.account.findUniqueOrThrow({
      where: { id },
      select: {
        policyRulesHistory: {
          where: { OR: [{ activeRulesOf: {} }, { draftRulesOf: {} }] },
          select: {
            approvers: { select: { userId: true } },
          },
        },
      },
    });
    const approvers = rules.flatMap((r) => r.approvers.map((a) => a.userId));

    await Promise.all(
      approvers.map((user) =>
        this.pubsub.publish<AccountSubscriptionPayload>(
          `${USER_ACCOUNT_SUBSCRIPTION}.${user}`,
          payload,
        ),
      ),
    );
  }
}
