import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  asAddress,
  Address,
  deployAccountProxy,
  toDeploySalt,
  randomDeploySalt,
  asPolicyKey,
  calculateProxyAddress,
} from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProviderService } from '~/features/util/provider/provider.service';
import { PubsubService } from '../util/pubsub/pubsub.service';
import assert from 'assert';
import {
  AccountSubscriptionPayload,
  ACCOUNT_SUBSCRIPTION,
  USER_ACCOUNT_SUBSCRIPTION,
  AccountEvent,
  CreateAccountInput,
  UpdateAccountInput,
} from './accounts.args';
import {
  POLICY_STATE_FIELDS,
  getDefaultPolicyName,
  inputAsPolicy,
  policyAsCreateState,
  prismaAsPolicy,
} from '../policies/policies.util';
import { CONFIG } from '~/config';
import { getUser, getRequestContext } from '~/request/ctx';
import { ContractsService } from '../contracts/contracts.service';
import { FaucetService } from '../faucet/faucet.service';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private pubsub: PubsubService,
    private contracts: ContractsService,
    private faucet: FaucetService,
  ) {}

  findUnique = this.prisma.asUser.account.findUnique;
  findMany = this.prisma.asUser.account.findMany;

  async createAccount<R extends Prisma.AccountArgs>(
    { name, policies: policyInputs }: CreateAccountInput,
    res?: Prisma.SelectSubset<R, Prisma.AccountArgs>,
  ) {
    const impl = CONFIG.accountImplAddress;
    const deploySalt = randomDeploySalt();

    const policies = policyInputs.map((p, i) => {
      const key = asPolicyKey(i);

      return {
        ...inputAsPolicy(key, p),
        name: p.name || getDefaultPolicyName(key),
      };
    });

    const account = await this.provider.useProxyFactory((factory) =>
      calculateProxyAddress({ impl, policies }, factory, deploySalt),
    );

    // Add account to user context
    getUser().accounts.add(account);
    getRequestContext()?.session?.accounts?.push(account);

    await this.prisma.asUser.$transaction(async (prisma) => {
      const { policyStates } = await prisma.account.create({
        data: {
          id: account,
          deploySalt,
          impl,
          name,
          policies: {
            create: policies.map(
              (policy): Prisma.PolicyCreateWithoutAccountInput => ({
                key: policy.key,
                name: policy.name,
                states: {
                  create: {
                    ...policyAsCreateState(policy),
                  },
                },
              }),
            ),
          },
        },
        select: {
          policyStates: {
            select: {
              id: true,
              policyKey: true,
            },
          },
        },
      });

      // Set policy rules as draft of policies - this can't be done in the same create as the account )':
      await Promise.all(
        policyStates.map(({ id, policyKey }) =>
          prisma.policy.update({
            where: { accountId_key: { accountId: account, key: policyKey } },
            data: { draftId: id },
            select: null,
          }),
        ),
      );
    });

    const r = await this.activateAccount(account, res);

    this.publishAccount({ account: { id: account }, event: AccountEvent.create });
    await this.contracts.addAccountAsVerified(account);
    this.faucet.requestTokens(account);

    return r;
  }

  async updateAccount<R extends Prisma.AccountArgs>(
    { id, name }: UpdateAccountInput,
    res?: Prisma.SelectSubset<R, Prisma.AccountArgs>,
  ) {
    const r = await this.prisma.asUser.account.update({
      where: { id },
      data: { name },
      ...res,
    });

    this.publishAccount({ account: { id }, event: AccountEvent.update });

    return r;
  }

  private async activateAccount<R extends Prisma.AccountArgs>(
    accountAddr: Address,
    res?: Prisma.SelectSubset<R, Prisma.AccountArgs>,
  ) {
    const {
      impl,
      deploySalt,
      isActive,
      policyStates: states,
    } = await this.prisma.asUser.account.findUniqueOrThrow({
      where: { id: accountAddr },
      select: {
        impl: true,
        deploySalt: true,
        isActive: true,
        // Initialization rules
        policyStates: {
          where: { proposal: null },
          select: {
            id: true,
            ...POLICY_STATE_FIELDS,
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
          policies: states.map(prismaAsPolicy),
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
          update: states.map((r) => ({
            where: { accountId_key: { accountId: accountAddr, key: r.policyKey } },
            data: { activeId: r.id, draftId: null },
          })),
        },
      },
      ...res,
    }); // as Prisma.Prisma__AccountClient<Prisma.AccountGetPayload<R>>;
  }

  private async publishAccount({ event, account: { id } }: AccountSubscriptionPayload) {
    const payload: AccountSubscriptionPayload = { event, account: { id } }; // Reconstruct to exclude other fields
    await this.pubsub.publish<AccountSubscriptionPayload>(`${ACCOUNT_SUBSCRIPTION}.${id}`, payload);

    // Publish event to all users with access to the account
    const { policyStates: states } = await this.prisma.asUser.account.findUniqueOrThrow({
      where: { id },
      select: {
        policyStates: {
          where: { OR: [{ activeOf: {} }, { draftOf: {} }] },
          select: {
            approvers: { select: { userId: true } },
          },
        },
      },
    });
    const approvers = states.flatMap((r) => r.approvers.map((a) => a.userId));

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
