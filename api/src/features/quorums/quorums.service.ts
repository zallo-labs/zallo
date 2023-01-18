import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { ACCOUNT_INTERFACE, Address, hashQuorum, Quorum, QuorumGuid, QuorumKey } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { connectAccount, connectOrCreateUser, connectQuorum } from '~/util/connect-or-create';
import { ProposalsService } from '../proposals/proposals.service';
import { SpendingInput } from './quorums.args';
import { Quorum as QuorumModel } from '@gen/quorum/quorum.model';

interface CreateStateParams {
  proposer: Address;
  account: Address;
  key: QuorumKey;
  proposingQuorumKey: QuorumKey;
  approvers: Set<Address>;
  spending?: SpendingInput;
  tx: Prisma.TransactionClient;
  quorumArgs?: Prisma.QuorumArgs;
}

const WHERE_QUROUM_IS_ACTIVE = {
  OR: [
    {
      // When the account is active
      proposal: {
        transactions: { some: { response: { success: true } } },
      },
    },
    {
      // Initialization quorum
      proposalId: null,
      account: { isActive: true },
    },
    {
      // When the quorum is not active, thus a proposal to remove is not required
      isActiveWithoutProposal: true,
    },
  ],
} satisfies Partial<Prisma.QuorumStateWhereInput>;

@Injectable()
export class QuorumsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ProposalsService)) private proposals: ProposalsService,
  ) {}

  async createUpsertState({
    proposer,
    account,
    key,
    proposingQuorumKey,
    approvers,
    spending,
    tx,
    quorumArgs,
  }: CreateStateParams): Promise<QuorumModel> {
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

    const { id: proposalId } = await this.proposals.create(
      {
        account,
        data: {
          to: account,
          data: ACCOUNT_INTERFACE.encodeFunctionData('upsertQuorum', [key, hashQuorum(quorum)]),
          proposer: { connect: { id: proposer } },
          quorum: connectQuorum(account, proposingQuorumKey),
        },
        select: {
          id: true,
        },
      },
      tx,
    );

    const r = await tx.quorumState.create({
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
        quorum: quorumArgs,
      },
    });

    return r.quorum;
  }

  async activeState<T extends Prisma.QuorumStateFindFirstArgs>(
    { account, key }: QuorumGuid,
    args?: Prisma.SelectSubset<T, Prisma.QuorumStateFindFirstArgs>,
  ) {
    const r = await this.prisma.quorumState.findFirst({
      ...args!,
      where: {
        accountId: account,
        quorumKey: key,
        ...WHERE_QUROUM_IS_ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    });

    return !r?.isRemoved ? r : null;
  }

  proposedStatesQuery({ account, key }: QuorumGuid) {
    return {
      where: {
        accountId: account,
        quorumKey: key,
        NOT: WHERE_QUROUM_IS_ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    } satisfies Prisma.QuorumStateFindManyArgs;
  }

  async proposedStates<T extends Prisma.QuorumStateFindManyArgs>(
    quorum: QuorumGuid,
    args?: Omit<Prisma.SelectSubset<T, Prisma.QuorumStateFindManyArgs>, 'where' | 'orderBy'>,
  ) {
    return this.prisma.quorumState.findMany({
      ...args,
      ...this.proposedStatesQuery(quorum),
    }) as PrismaPromise<Array<Prisma.QuorumStateGetPayload<T>>>;
  }
}
