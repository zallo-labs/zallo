import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
import { asAddress, Address, toDeploySalt, randomDeploySalt, asPolicyKey, asHex } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProviderService } from '~/features/util/provider/provider.service';
import { PubsubService } from '../util/pubsub/pubsub.service';
import {
  ACCOUNT_SUBSCRIPTION,
  USER_ACCOUNT_SUBSCRIPTION,
  AccountEvent,
  CreateAccountInput,
  UpdateAccountInput,
} from './accounts.args';
import { POLICY_STATE_FIELDS, inputAsPolicy, prismaAsPolicy } from '../policies/policies.util';
import { CONFIG } from '~/config';
import { ContractsService } from '../contracts/contracts.service';
import { FaucetService } from '../faucet/faucet.service';
import { PoliciesService } from '../policies/policies.service';
import { getUser } from '~/request/ctx';
import { UserInputError } from 'apollo-server-core';
import { InjectQueue } from '@nestjs/bull';
import { ACCOUNTS_QUEUE, AccountActivationEvent } from './accounts.queue';
import { Queue } from 'bull';

export interface AccountSubscriptionPayload {
  [ACCOUNT_SUBSCRIPTION]: Pick<Account, 'id'>;
  event: AccountEvent;
}

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    private pubsub: PubsubService,
    private contracts: ContractsService,
    private faucet: FaucetService,
    private policies: PoliciesService,
    @InjectQueue(ACCOUNTS_QUEUE.name)
    private activationQueue: Queue<AccountActivationEvent>,
  ) {}

  findUnique = this.prisma.asUser.account.findUnique;
  findMany = this.prisma.asUser.account.findMany;

  async createAccount<R extends Prisma.AccountArgs>(
    { name, policies: policyInputs }: CreateAccountInput,
    res?: Prisma.SelectSubset<R, Prisma.AccountArgs>,
  ) {
    const user = getUser();
    if (!policyInputs.find((p) => p.approvers.includes(user)))
      throw new UserInputError('User must be included in at least one policy');

    const impl = CONFIG.accountImplAddress;
    const deploySalt = randomDeploySalt();
    const policyKeys = policyInputs.map((p, i) => asPolicyKey(p.key ?? i));

    const account = await this.provider.getProxyAddress({
      impl,
      salt: deploySalt,
      policies: policyInputs.map((p, i) => inputAsPolicy(policyKeys[i], p)),
    });

    const r = await this.prisma.asUser.$transaction(async (prisma) => {
      // Prisma create always SELECTs after the INSERT. However the user isn't yet a member of the account - https://github.com/prisma/prisma/issues/4246
      // createMany doesn't have this behaviour
      await prisma.account.createMany({
        data: {
          id: account,
          deploySalt,
          impl,
          name,
        },
      });

      await Promise.all(
        policyInputs.map((policy, i) =>
          this.policies.create(
            { ...policy, account, key: policyKeys[i], skipProposal: true },
            { select: null },
          ),
        ),
      );

      return prisma.account.findUniqueOrThrow({ where: { id: account }, ...res });
    });

    await this.publishAccount({ account: { id: account }, event: AccountEvent.create });
    await this.activateAccount(account);
    this.contracts.addAccountAsVerified(account);
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

  private async activateAccount(account: Address) {
    const {
      impl,
      deploySalt,
      isActive,
      policyStates: states,
    } = await this.prisma.asUser.account.findUniqueOrThrow({
      where: { id: account },
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
    if (isActive) throw new Error('Account is already active');

    const { transaction } = await this.provider.deployProxy({
      impl: asAddress(impl),
      policies: states.map(prismaAsPolicy),
      salt: toDeploySalt(deploySalt),
    });

    this.activationQueue.add({ account, transaction: asHex(transaction.hash) });
  }

  async publishAccount({ event, account: { id } }: AccountSubscriptionPayload) {
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
