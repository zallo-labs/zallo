import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, Transaction, TransactionResponse } from '@prisma/client';
import {
  ACCOUNT_INTERFACE,
  Address,
  hashQuorum,
  mapAsync,
  Quorum,
  QuorumGuid,
  QuorumKey,
  toQuorumKey,
} from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { connectAccount, connectOrCreateUser, connectQuorum } from '~/util/connect-or-create';
import { ProposalsService } from '../proposals/proposals.service';
import {
  CreateQuorumArgs,
  RemoveQuorumArgs,
  SpendingInput,
  UpdateQuorumArgs,
  UpdateQuorumMetadataArgs,
} from './quorums.args';
import { getUserId } from '~/request/ctx';
import { UserInputError } from 'apollo-server-core';
import { TransactionsConsumer } from '../transactions/transactions.consumer';

interface CreateStateParams {
  account: Address;
  key: QuorumKey;
  proposingQuorumKey: QuorumKey;
  approvers: Set<Address>;
  spending?: SpendingInput;
  tx?: Prisma.TransactionClient;
}

type ArgsParam<T> = Prisma.SelectSubset<T, Prisma.QuorumArgs>;

@Injectable()
export class QuorumsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
    @Inject(forwardRef(() => TransactionsConsumer))
    private transactionsConsumer: TransactionsConsumer,
  ) {}

  onModuleInit() {
    this.transactionsConsumer.addProcessor(QuorumsService.name, this.processTransaction);
  }

  findUnique = this.prisma.asUser.quorum.findUnique;
  findUniqueOrThrow = this.prisma.asUser.quorum.findUniqueOrThrow;
  findMany = this.prisma.asUser.quorum.findMany;

  async create<A extends Prisma.QuorumArgs>(
    { account, proposingQuorumKey, approvers, spending, name }: CreateQuorumArgs,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.asUser.$transaction(async (tx) => {
      const existingQuorums = await tx.quorum.count({ where: { accountId: account } });
      const key = toQuorumKey(existingQuorums + 1);

      await tx.quorum.create({
        data: {
          accountId: account,
          key,
          name: name || `Quorum ${key}`,
        },
        select: null,
      });

      return this.proposeState(
        {
          account,
          key,
          proposingQuorumKey,
          approvers,
          spending,
          tx,
        },
        res,
      );
    });
  }

  async update<A extends Prisma.QuorumArgs>(args: UpdateQuorumArgs, res?: ArgsParam<A>) {
    return this.proposeState(
      {
        ...args,
        proposingQuorumKey: args.proposingQuorumKey ?? args.key,
      },
      res,
    );
  }

  async updateMetadata<A extends Prisma.QuorumArgs>(
    { account, key, name }: UpdateQuorumMetadataArgs,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.asUser.quorum.update({
      where: { accountId_key: { accountId: account, key } },
      data: { name },
      ...res,
    });
  }

  async remove<A extends Prisma.QuorumArgs>(
    { account, key, proposingQuorumKey = key }: RemoveQuorumArgs,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.asUser.$transaction(async (tx) => {
      const isActive = !!(
        await tx.quorum.findUniqueOrThrow({
          where: { accountId_key: { accountId: account, key } },
          select: { activeStateId: true },
        })
      ).activeStateId;

      // No proposal is required if the quorum isn't active
      const proposal =
        isActive &&
        (await this.proposals.propose(
          {
            account,
            quorumKey: proposingQuorumKey,
            to: account,
            data: ACCOUNT_INTERFACE.encodeFunctionData('removeQuorum', [key]),
          },
          { select: { id: true } },
          tx,
        ));

      const state = await tx.quorumState.create({
        data: {
          account: connectAccount(account),
          quorum: connectQuorum(account, key),
          isRemoved: true,
          ...(proposal
            ? { proposal: { connect: { id: proposal.id } } }
            : { activeStateOfQuorum: connectQuorum(account, key) }),
        },
        select: { quorum: { ...res } },
      });

      return state.quorum;
    });
  }

  private async proposeState<A extends Prisma.QuorumArgs>(
    { account, key, proposingQuorumKey, approvers, spending, tx }: CreateStateParams,
    res?: ArgsParam<A>,
  ) {
    return this.prisma.$transactionAsUser(tx, async (tx) => {
      const quorum: Quorum = {
        key,
        approvers,
        spending: spending
          ? {
              fallback: spending.fallback,
              limits: Object.fromEntries(
                (spending.limits ?? []).map((limit) => [limit.token, limit] as const),
              ),
            }
          : undefined,
      };

      const { id: proposalId } = await this.proposals.propose(
        {
          account,
          quorumKey: proposingQuorumKey,
          to: account,
          data: ACCOUNT_INTERFACE.encodeFunctionData('upsertQuorum', [key, hashQuorum(quorum)]),
        },
        { select: { id: true } },
        tx,
      );

      const state = await tx.quorumState.create({
        data: {
          proposal: { connect: { id: proposalId } },
          account: connectAccount(account),
          quorum: connectQuorum(account, key),
          approvers: {
            create: [...approvers].map((approver) => ({
              user: connectOrCreateUser(approver),
            })),
          },
          spendingFallback: spending?.fallback,
          limits: spending?.limits
            ? {
                createMany: {
                  data: Object.values(spending.limits).map((limit) => ({
                    token: limit.token,
                    amount: limit.amount.toString(),
                    period: limit.period,
                  })),
                },
              }
            : undefined,
        },
        select: {
          quorum: { ...res },
        },
      });

      return state.quorum;
    });
  }

  // TODO: write tests for
  async getDefaultQuorum(account: Address): Promise<QuorumGuid> {
    const quorum = await this.prisma.asUser.quorumState.findFirst({
      where: {
        accountId: account,
        approvers: { some: { userId: getUserId() } },
        isRemoved: false,
      },
      orderBy: [{ approvers: { _count: 'asc' } }, { id: 'asc' }],
      select: { quorumKey: true },
    });

    if (!quorum) throw new UserInputError('No quorum could be found for this account');

    return { account, key: toQuorumKey(quorum.quorumKey) };
  }

  private async processTransaction(resp: TransactionResponse) {
    if (!resp.success) return;

    const { proposal } = await this.prisma.asSuperuser.transaction.findUniqueOrThrow({
      where: { hash: resp.transactionHash },
      select: {
        proposal: {
          select: {
            quorumStates: {
              select: {
                id: true,
                quorum: {
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

    await mapAsync(proposal.quorumStates, (state) =>
      this.prisma.asUser.quorum.update({
        where: {
          accountId_key: {
            accountId: state.quorum.accountId,
            key: state.quorum.key,
          },
        },
        data: {
          activeStateId: state.id,
        },
      }),
    );
  }
}
