import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ACCOUNT_INTERFACE, Address, hashQuorum, Quorum, QuorumKey } from 'lib';
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
  tx?: Prisma.TransactionClient;
  quorumArgs?: Prisma.QuorumArgs;
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
}
