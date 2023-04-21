import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ACCOUNT_INTERFACE,
  Address,
  asAddress,
  asHex,
  asPolicyKey,
  asTargets,
  getTransactionSatisfiability,
  mapAsync,
  Policy,
  POLICY_ABI,
  PolicySatisfiability,
  Tx,
} from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { connectAccount, connectOrCreateUser, connectPolicy } from '~/util/connect-or-create';
import { ProposalsService } from '../proposals/proposals.service';
import { CreatePolicyInput, UniquePolicyInput, UpdatePolicyInput } from './policies.args';
import {
  TransactionResponseData,
  TransactionsProcessor,
} from '../transactions/transactions.processor';
import { inputAsPolicy, POLICY_STATE_FIELDS, prismaAsPolicy, PrismaPolicy } from './policies.util';
import merge from 'ts-deepmerge';
import _ from 'lodash';
import { UserInputError } from 'apollo-server-core';
import { UserAccountsService } from '../auth/userAccounts.service';

interface CreateParams extends CreatePolicyInput {
  skipProposal?: boolean;
}

interface CreateStateParams {
  prisma?: Prisma.TransactionClient;
  account: Address;
  policy: Policy;
  skipProposal?: boolean;
}

type ArgsParam<T> = Prisma.SelectSubset<T, Prisma.PolicyArgs>;

export type SelectManyPoliciesArgs = Omit<Prisma.PolicyFindManyArgs, 'where' | 'include'>;

@Injectable()
export class PoliciesService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
    @Inject(forwardRef(() => TransactionsProcessor))
    private transactionsConsumer: TransactionsProcessor,
    private userAccounts: UserAccountsService,
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
    { account, name, key: keyArg, skipProposal, ...policyInput }: CreateParams,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.asUser.$transaction(async (prisma) => {
      const key = keyArg ?? (await this.getNextKey(account));
      const policy = inputAsPolicy(key, policyInput);

      // User needs to belong to the account before they can create a policy
      await this.addApproversToAccount(account, policy);

      await prisma.policy.create({
        data: {
          accountId: account,
          key,
          name: name || `Policy ${key}`,
        },
        select: null,
      });

      return this.createState({ prisma, account, skipProposal, policy }, res);
    });
  }

  async update<A extends Prisma.PolicyArgs>(
    { account, key, name, approvers, threshold, permissions }: UpdatePolicyInput,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.asUser.$transaction(async (prisma) => {
      // State
      if (approvers || threshold !== undefined || permissions) {
        const r = await prisma.policy.findUnique({
          where: { accountId_key: { accountId: account, key } },
          select: {
            active: { select: POLICY_STATE_FIELDS },
            draft: { select: POLICY_STATE_FIELDS },
          },
        });

        const p = r?.draft ?? r?.active;
        if (!p) throw new UserInputError("Can't update policy that doesn't exist");

        const policy = prismaAsPolicy(p);
        if (approvers) policy.approvers = new Set(approvers);
        if (threshold !== undefined) policy.threshold = threshold;
        if (permissions)
          policy.permissions = {
            targets: asTargets(permissions.targets),
          };

        await this.addApproversToAccount(account, policy);
        await this.createState({ prisma, account, policy });
      }

      // Metadata
      return this.prisma.asUser.policy.update({
        where: { accountId_key: { accountId: account, key } },
        data: { name },
        ...res,
      });
    });
  }

  async remove<A extends Prisma.PolicyArgs>(
    { account, key }: UniquePolicyInput,
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

      const state = await prisma.policyState.create({
        data: {
          account: connectAccount(account),
          policy: connectPolicy(account, key),
          isRemoved: true,
          ...(proposal
            ? { proposal: { connect: { id: proposal.id } } }
            : { activeOf: connectPolicy(account, key) }),
        },
        select: { policy: { ...res } },
      });

      return state.policy;
    });
  }

  private async createState<A extends Prisma.PolicyArgs>(
    { prisma, account, policy, skipProposal }: CreateStateParams,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.$transactionAsUser(prisma, async (prisma) => {
      // Proposal may be skipped on account creation
      const proposal =
        !skipProposal &&
        (await this.proposals.propose(
          {
            account,
            to: account,
            data: asHex(
              ACCOUNT_INTERFACE.encodeFunctionData('addPolicy', [POLICY_ABI.asStruct(policy)]),
            ),
          },
          { select: { id: true } },
          prisma,
        ));

      const state = await prisma.policyState.create({
        data: {
          policy: connectPolicy(account, policy.key),
          account: connectAccount(account),
          draftOf: connectPolicy(account, policy.key),
          ...(proposal && { proposal: { connect: { id: proposal.id } } }),
          approvers: {
            create: [...policy.approvers].map((approver) => ({
              user: connectOrCreateUser(approver),
            })),
          },
          threshold: policy.threshold,
          targets: {
            create: Object.entries(policy.permissions.targets).map(([to, selectors]) => ({
              to,
              selectors: [...selectors],
            })),
          },
        },
        select: {
          policy: { ...res },
        },
      });

      return state.policy;
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
        ..._.omit(queryArgs, ['select']),
        select: {
          ...merge(_.omit(queryArgs?.select ?? {}, ['id', 'satisfied', 'requiresUserAction']), {
            active: {
              select: POLICY_STATE_FIELDS,
            },
          }),
        },
      })
    ).map((p) => prismaAsPolicy(p!.active as PrismaPolicy));

    const tx: Tx = {
      to: asAddress(proposal.to),
      value: proposal.value ? BigInt(proposal.value.toString()) : undefined,
      data: asHex(proposal.data ?? undefined),
      nonce: proposal.nonce,
      gasLimit: proposal.gasLimit || undefined,
    };

    const approvals = new Set(
      proposal.approvals.filter((a) => a.signature).map((a) => asAddress(a.userId)),
    );

    for (const policy of policies) {
      const sat = getTransactionSatisfiability(policy, tx, approvals);
      yield [policy, sat] as const;
    }
  }

  async *satisifiedPolicies(proposalId: string, queryArgs?: SelectManyPoliciesArgs) {
    for await (const [policy, sat] of this.policiesWithSatisfiability(proposalId, queryArgs)) {
      if (sat === PolicySatisfiability.Satisfied) yield policy;
    }
  }

  private async processTransaction({ transactionHash, response: resp }: TransactionResponseData) {
    if (!resp.success) return;

    const { proposal } = await this.prisma.asSystem.transaction.findUniqueOrThrow({
      where: { hash: transactionHash },
      select: {
        proposal: {
          select: {
            accountId: true,
            policyStates: {
              select: {
                id: true,
                policy: {
                  select: {
                    accountId: true,
                    key: true,
                  },
                },
                approvers: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });

    await mapAsync(proposal.policyStates, (state) => {
      return this.prisma.asSystem.policy.update({
        where: {
          accountId_key: {
            accountId: state.policy.accountId,
            key: state.policy.key,
          },
        },
        data: {
          activeId: state.id,
          draftId: null,
        },
      });
    });
  }

  private async getNextKey(account: Address) {
    const aggregate = await this.prisma.asUser.policy.aggregate({
      where: { accountId: account },
      _max: { key: true },
    });

    return asPolicyKey(aggregate._max?.key ?? 0);
  }

  // Note. approvers aren't removed when a draft is replaced they were previously an approver of
  // These users will have account access until the cache expires.
  // This prevent loss of account access on an accidental draft be should be considered more thoroughly
  private async addApproversToAccount(account: Address, policy: Policy) {
    return Promise.all(
      [...policy.approvers].map((user) => this.userAccounts.add({ user, account })),
    );
  }
}
