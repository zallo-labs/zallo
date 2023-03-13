import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, TransactionResponse } from '@prisma/client';
import {
  ACCOUNT_INTERFACE,
  Address,
  Approval,
  ApprovalsRule,
  asAddress,
  asHex,
  asPolicyKey,
  compareAddress,
  FunctionsRule,
  isPresent,
  mapAsync,
  Policy,
  PolicyKey,
  PolicySatisfiability,
  TargetsRule,
  Tx,
} from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { connectAccount, connectOrCreateUser, connectPolicy } from '~/util/connect-or-create';
import { ProposalsService } from '../proposals/proposals.service';
import { CreatePolicyArgs, RulesInput, UniquePolicyArgs, UpdatePolicyArgs } from './policies.args';
import { TransactionsConsumer } from '../transactions/transactions.consumer';
import { ProviderService } from '../util/provider/provider.service';
import { prismaAsPolicy, PrismaPolicy } from './policies.util';
import merge from 'ts-deepmerge';

interface CreateRulesParams {
  prisma?: Prisma.TransactionClient;
  account: Address;
  key: PolicyKey;
  rules: RulesInput;
}

type ArgsParam<T> = Prisma.SelectSubset<T, Prisma.PolicyArgs>;

export type SelectManyPoliciesArgs = Omit<Prisma.PolicyFindManyArgs, 'where' | 'include'>;

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
    return this.prisma.asUser.$transaction(async (prisma) => {
      const existingPolicies = await prisma.policy.count({ where: { accountId: account } });
      const key = asPolicyKey(existingPolicies + 1);

      await prisma.policy.create({
        data: {
          accountId: account,
          key: key as bigint,
          name: name || `Policy ${key}`,
        },
        select: null,
      });

      return this.proposeRules({ prisma, account, key, rules }, res);
    });
  }

  async update<A extends Prisma.PolicyArgs>(
    { account, key, name, rules }: UpdatePolicyArgs,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.asUser.$transaction(async (prisma) => {
      // Rules
      if (rules) await this.proposeRules({ prisma, account, key, rules });

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
    prisma?: Prisma.TransactionClient,
  ) {
    return this.prisma.$transactionAsUser(prisma, async (prisma) => {
      const isActive = !!(
        await prisma.policy.findUniqueOrThrow({
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
            data: asHex(ACCOUNT_INTERFACE.encodeFunctionData('removePolicy', [key])),
          },
          { select: { id: true } },
          prisma,
        ));

      const rules = await prisma.policyRules.create({
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
    { prisma, account, key, rules }: CreateRulesParams,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.$transactionAsUser(prisma, async (prisma) => {
      const policy = new Policy(
        key,
        ...[
          rules.approvers?.size ? new ApprovalsRule(rules.approvers) : null,
          rules.onlyFunctions?.size ? new FunctionsRule(rules.onlyFunctions) : null,
          rules.onlyTargets?.size ? new TargetsRule(rules.onlyTargets) : null,
        ].filter(isPresent),
      );

      const { id: proposalId } = await this.proposals.propose(
        {
          account,
          to: account,
          data: asHex(ACCOUNT_INTERFACE.encodeFunctionData('addPolicy', [policy.struct])),
        },
        { select: { id: true } },
        prisma,
      );

      const policyRules = await prisma.policyRules.create({
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

  async *policiesWithSatisfiability(proposalId: string, queryArgs?: SelectManyPoliciesArgs) {
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
        ...merge(queryArgs ?? {}, {
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
        } as const),
      })
    ).map((p) => prismaAsPolicy(p!.active as PrismaPolicy));

    const tx: Tx = {
      to: asAddress(proposal.to),
      value: proposal.value ? BigInt(proposal.value.toString()) : undefined,
      data: asHex(proposal.data ?? undefined),
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

    const account = this.provider.connectAccount(proposal.accountId);

    for (const policy of policies) {
      const sat = await policy.satisfiability({ domainParams: account, tx, signatures });
      yield [policy, sat] as const;
    }
  }

  async *satisifiedPolicies(proposalId: string, queryArgs?: SelectManyPoliciesArgs) {
    for await (const [policy, sat] of this.policiesWithSatisfiability(proposalId, queryArgs)) {
      if (sat === PolicySatisfiability.Satisfied) yield policy;
    }
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
