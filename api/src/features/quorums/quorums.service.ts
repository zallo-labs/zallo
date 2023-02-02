import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ACCOUNT_INTERFACE, Address, hashQuorum, mapAsync, Quorum, QuorumKey } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { connectAccount, connectOrCreateUser, connectQuorum } from '~/util/connect-or-create';
import { ProposalsService } from '../proposals/proposals.service';
import { SpendingInput } from './quorums.args';
import { Quorum as QuorumModel } from '@gen/quorum/quorum.model';

interface CreateStateParams {
  account: Address;
  key: QuorumKey;
  proposingQuorumKey: QuorumKey;
  approvers: Set<Address>;
  spending?: SpendingInput;
  tx?: Prisma.TransactionClient;
  quorumArgs?: Prisma.QuorumArgs;
}

@Injectable()
export class QuorumsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
  ) {}

  async createUpsertState({
    account,
    key,
    proposingQuorumKey,
    approvers,
    spending,
    tx = this.prisma,
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
        quorum: { account, key: proposingQuorumKey },
        options: {
          to: account,
          data: ACCOUNT_INTERFACE.encodeFunctionData('upsertQuorum', [key, hashQuorum(quorum)]),
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

  async handleSuccessfulTransaction(transactionHash: string) {
    const { proposal } = await this.prisma.transaction.findUniqueOrThrow({
      where: { hash: transactionHash },
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

    return mapAsync(proposal.quorumStates, (state) =>
      this.prisma.quorum.update({
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
