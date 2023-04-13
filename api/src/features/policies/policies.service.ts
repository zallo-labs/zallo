import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, TransactionResponse } from '@prisma/client';
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
import { connectAccount, connectPolicy } from '~/util/connect-or-create';
import { ProposalsService } from '../proposals/proposals.service';
import { CreatePolicyInput, UniquePolicyInput, UpdatePolicyInput } from './policies.args';
import { TransactionsConsumer } from '../transactions/transactions.consumer';
import { ProviderService } from '../util/provider/provider.service';
import {
  getDefaultPolicyName,
  inputAsPolicy,
  POLICY_STATE_FIELDS,
  policyAsCreateState,
  prismaAsPolicy,
  PrismaPolicy,
} from './policies.util';
import merge from 'ts-deepmerge';
import _ from 'lodash';
import { UserInputError } from 'apollo-server-core';

interface ProposeStateParams {
  prisma?: Prisma.TransactionClient;
  account: Address;
  policy: Policy;
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
    { account, name, ...policyInput }: CreatePolicyInput,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.asUser.$transaction(async (prisma) => {
      const existingPolicies = await prisma.policy.count({ where: { accountId: account } });
      const key = asPolicyKey(existingPolicies + 1); // TODO: count key from 0 instead?

      await prisma.policy.create({
        data: {
          accountId: account,
          key,
          name: name || getDefaultPolicyName(key),
        },
        select: null,
      });

      return this.proposeState({ prisma, account, policy: inputAsPolicy(key, policyInput) }, res);
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

        const policy = { ...prismaAsPolicy(p) };
        if (approvers) policy.approvers = new Set(approvers);
        if (threshold !== undefined) policy.threshold = threshold;
        if (permissions)
          policy.permissions = {
            targets: asTargets(permissions.targets),
          };

        await this.proposeState({ prisma, account, policy });
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

  private async proposeState<A extends Prisma.PolicyArgs>(
    { prisma, account, policy }: ProposeStateParams,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.$transactionAsUser(prisma, async (prisma) => {
      const { id: proposalId } = await this.proposals.propose(
        {
          account,
          to: account,
          data: asHex(
            ACCOUNT_INTERFACE.encodeFunctionData('addPolicy', [POLICY_ABI.asStruct(policy)]),
          ),
        },
        { select: { id: true } },
        prisma,
      );

      const state = await prisma.policyState.create({
        data: {
          proposal: { connect: { id: proposalId } },
          policy: connectPolicy(account, policy.key),
          account: connectAccount(account),
          ...policyAsCreateState(policy),
          draftOf: connectPolicy(account, policy.key),
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

  private async processTransaction(resp: TransactionResponse) {
    if (!resp.success) return;

    const { proposal } = await this.prisma.asSuperuser.transaction.findUniqueOrThrow({
      where: { hash: resp.transactionHash },
      select: {
        proposal: {
          select: {
            policyStates: {
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

    await mapAsync(proposal.policyStates, (state) =>
      this.prisma.asSuperuser.policy.update({
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
      }),
    );
  }
}
