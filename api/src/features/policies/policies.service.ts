import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, TransactionResponse } from '@prisma/client';
import {
  ACCOUNT_INTERFACE,
  Address,
  Approval,
  ApprovalsRule,
  asAddress,
  asPolicyKey,
  compareAddress,
  filterAsync,
  FunctionRule,
  isPresent,
  mapAsync,
  OnlySatisfied,
  Policy,
  PolicyKey,
  TargetRule,
  Tx,
} from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { connectAccount, connectOrCreateUser, connectPolicy } from '~/util/connect-or-create';
import { ProposalsService } from '../proposals/proposals.service';
import { CreatePolicyArgs, RulesInput, UniquePolicyArgs, UpdatePolicyArgs } from './policies.args';
import { TransactionsConsumer } from '../transactions/transactions.consumer';
import { ProviderService } from '../util/provider/provider.service';
import { prismaAsPolicy } from './policies.util';

interface CreateRulesParams {
  client?: Prisma.TransactionClient;
  account: Address;
  key: PolicyKey;
  rules: RulesInput;
}

type ArgsParam<T> = Prisma.SelectSubset<T, Prisma.PolicyArgs>;

@Injectable()
export class PoliciesService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
    @Inject(forwardRef(() => TransactionsConsumer))
    private transactionsConsumer: TransactionsConsumer,
  ) {}

  onModuleInit() {
    this.transactionsConsumer.addProcessor(PoliciesService.name, (...args) =>
      this.processTransaction(...args),
    );
  }

  findUnique = this.prisma.asUser.policy.findUnique;
  findUniqueOrThrow = this.prisma.asUser.policy.findUniqueOrThrow;
  findMany = this.prisma.asUser.policy.findMany;

  async create<A extends Prisma.PolicyArgs>(
    { account, name, rules }: CreatePolicyArgs,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.asUser.$transaction(async (tx) => {
      const existingQuorums = await tx.policy.count({ where: { accountId: account } });
      const key = asPolicyKey(existingQuorums + 1);

      await tx.policy.create({
        data: {
          accountId: account,
          key: key as bigint,
          name: name || `Policy ${key}`,
        },
        select: null,
      });

      return this.proposeRules({ client: tx, account, key, rules }, res);
    });
  }

  async update<A extends Prisma.PolicyArgs>(
    { account, key, name, rules }: UpdatePolicyArgs,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.asUser.$transaction(async (tx) => {
      // Rules
      if (rules) await this.proposeRules({ client: tx, account, key, rules });

      // Metadata
      return this.prisma.asUser.policy.update({
        where: { accountId_key: { accountId: account, key } },
        data: { name },
        ...res,
      });
    });
  }

  async remove<A extends Prisma.PolicyArgs>(
    { account, key }: UniquePolicyArgs,
    res?: ArgsParam<A>,
    tx?: Prisma.TransactionClient,
  ) {
    return this.prisma.$transactionAsUser(tx, async (tx) => {
      const isActive = !!(
        await tx.policy.findUniqueOrThrow({
          where: { accountId_key: { accountId: account, key } },
          select: { activeId: true },
        })
      ).activeId;

      // No proposal is required if the policy isn't active
      const proposal =
        isActive &&
        (await this.proposals.propose(
          {
            account,
            to: account,
            data: ACCOUNT_INTERFACE.encodeFunctionData('removePolicy', [key]),
          },
          { select: { id: true } },
          tx,
        ));

      const rules = await tx.policyRules.create({
        data: {
          account: connectAccount(account),
          policy: connectPolicy(account, key),
          isRemoved: true,
          ...(proposal
            ? { proposal: { connect: { id: proposal.id } } }
            : { activeRulesOf: connectPolicy(account, key) }),
        },
        select: { policy: { ...res } },
      });

      return rules.policy;
    });
  }

  private async proposeRules<A extends Prisma.PolicyArgs>(
    { client, account, key, rules }: CreateRulesParams,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.$transactionAsUser(client, async (client) => {
      const policy = new Policy(
        key,
        [
          rules.approvers?.size ? new ApprovalsRule(rules.approvers) : null,
          rules.onlyFunctions?.size ? new FunctionRule(rules.onlyFunctions) : null,
          rules.onlyTargets?.size ? new TargetRule(rules.onlyTargets) : null,
        ].filter(isPresent),
      );

      const { id: proposalId } = await this.proposals.propose(
        {
          account,
          to: account,
          data: ACCOUNT_INTERFACE.encodeFunctionData('addPolicy', [policy.struct]),
        },
        { select: { id: true } },
        client,
      );

      const policyRules = await client.policyRules.create({
        data: {
          proposal: { connect: { id: proposalId } },
          policy: connectPolicy(account, key),
          account: connectAccount(account),
          ...(rules.approvers?.size && {
            approvers: {
              create: [...rules.approvers].map((approver) => ({
                user: connectOrCreateUser(approver),
              })),
            },
          }),
          ...(rules.onlyFunctions && {
            onlyFunctions: {
              set: [...rules.onlyFunctions],
            },
          }),
          ...(rules.onlyTargets && {
            onlyTargets: {
              set: [...rules.onlyTargets],
            },
          }),
        },
        select: {
          policy: { ...res },
        },
      });

      return policyRules.policy;
    });
  }

  async getSatisifiedPolicies(proposalId: string, only?: OnlySatisfied): Promise<Policy[]> {
    const proposal = await this.prisma.asUser.proposal.findUniqueOrThrow({
      where: { id: proposalId },
      select: {
        accountId: true,
        to: true,
        value: true,
        data: true,
        nonce: true,
        gasLimit: true,
        approvals: { select: { userId: true, signature: true } },
      },
    });

    const policies = (
      await this.prisma.asUser.policy.findMany({
        where: { accountId: proposal.accountId, active: { is: {} } },
        select: {
          active: {
            select: {
              policyKey: true,
              approvers: { select: { userId: true } },
              onlyFunctions: true,
              onlyTargets: true,
            },
          },
        },
      })
    ).map((p) => prismaAsPolicy(p.active!));

    const tx: Tx = {
      to: asAddress(proposal.to),
      value: proposal.value ? BigInt(proposal.value.toString()) : undefined,
      data: proposal.data || undefined,
      nonce: proposal.nonce,
      gasLimit: proposal.gasLimit || undefined,
    };

    const signatures = proposal.approvals
      .filter((a) => a.signature)
      .map(
        (a): Approval => ({
          approver: asAddress(a.userId),
          signature: a.signature!, // null signatures are filtered out
        }),
      )
      .sort((a, b) => compareAddress(a.approver, b.approver))
      .map((a) => a.signature);

    return filterAsync(policies, (policy) =>
      policy.isSatisfied({
        domainParams: this.provider.connectAccount(proposal.accountId),
        tx,
        signatures,
        only,
      }),
    );
  }

  async getFirstSatisfiedPolicy(
    proposalId: string,
    only?: OnlySatisfied,
  ): Promise<Policy | undefined> {
    return (await this.getSatisifiedPolicies(proposalId, only))[0];
  }

  private async processTransaction(resp: TransactionResponse) {
    if (!resp.success) return;

    const { proposal } = await this.prisma.asSuperuser.transaction.findUniqueOrThrow({
      where: { hash: resp.transactionHash },
      select: {
        proposal: {
          select: {
            policyRules: {
              select: {
                id: true,
                policy: {
                  select: {
                    accountId: true,
                    key: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    await mapAsync(proposal.policyRules, (rules) =>
      this.prisma.asSuperuser.policy.update({
        where: {
          accountId_key: {
            accountId: rules.policy.accountId,
            key: rules.policy.key,
          },
        },
        data: {
          activeId: rules.id,
        },
      }),
    );
  }
}
