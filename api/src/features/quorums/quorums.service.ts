import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { ACCOUNT_INTERFACE, Address, Quorum, QuorumGuid, QuorumKey, toQuorumStruct } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { connectAccount, connectQuorum } from '~/util/connect-or-create';
import { ProposalsService } from '../proposals/proposals.service';
import { SpendingConfigInput } from './quorums.args';

interface CreateStateParams {
  proposer: Address;
  account: Address;
  key: QuorumKey;
  proposingQuorumKey: QuorumKey;
  approvers: Set<Address>;
  spending?: SpendingConfigInput;
  tx: Prisma.TransactionClient;
  createArgs?: Omit<Prisma.QuorumStateCreateArgs, 'data'>;
}

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
    createArgs = {},
  }: CreateStateParams) {
    const quorum: Quorum = {
      key,
      approvers,
      spending: {
        allowlisted: spending?.allowlisted ?? false,
        limits: Object.fromEntries(
          (spending?.limits ?? []).map((limit) => [limit.token, limit] as const),
        ),
      },
    };

    const { id: proposalId } = await this.proposals.create(
      {
        account,
        data: {
          to: account,
          data: ACCOUNT_INTERFACE.encodeFunctionData('upsertQuorum', [key, toQuorumStruct(quorum)]),
          proposer: { connect: { id: proposer } },
          quorum: connectQuorum(account, proposingQuorumKey),
        },
        select: {
          id: true,
        },
      },
      tx,
    );

    return tx.quorumState.create({
      ...createArgs,
      data: {
        proposal: { connect: { id: proposalId } },
        account: connectAccount(account),
        quorum: connectQuorum(account, key),
        approvers: {
          createMany: {
            data: [...approvers].map((approver) => ({
              deviceId: approver,
            })),
          },
        },
        spendingAllowlisted: spending?.allowlisted,
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
    });
  }

  activeStateQuery({ account, key }: QuorumGuid) {
    return {
      where: {
        accountId: account,
        quorumKey: key,
        OR: [
          {
            proposal: {
              transactions: { some: { response: { success: true } } },
            },
          },
          {
            // Initialization quorum
            proposalId: null,
            account: { isActive: true },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    } satisfies Prisma.QuorumStateFindFirstArgs;
  }

  activeState<T extends Prisma.QuorumStateFindFirstArgs>(
    quorum: QuorumGuid,
    args?: Prisma.SelectSubset<T, Prisma.QuorumStateFindFirstArgs>,
  ) {
    return this.prisma.quorumState.findFirst({
      ...args!,
      ...this.activeStateQuery(quorum),
    });
  }

  async proposedStates<T extends Prisma.QuorumStateFindManyArgs>(
    { account, key }: QuorumGuid,
    args?: Omit<Prisma.SelectSubset<T, Prisma.QuorumStateFindManyArgs>, 'where' | 'orderBy'>,
  ) {
    return this.prisma.quorumState.findMany({
      ...args,
      where: {
        accountId: account,
        quorumKey: key,
        OR: [
          {
            proposal: {
              NOT: { transactions: { some: { response: { success: true } } } },
            },
          },
          {
            // Initialization quorum
            proposalId: null,
            account: { isActive: false },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    }) as PrismaPromise<Array<Prisma.QuorumStateGetPayload<T>>>;
  }
}
