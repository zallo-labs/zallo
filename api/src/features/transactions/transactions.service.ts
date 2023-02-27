import { BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { BigNumber } from 'ethers';
import {
  address,
  executeTx,
  TokenLimitPeriod,
  Signer,
  toTxSalt,
  toQuorumKey,
  toTx,
  TokenLimit,
} from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProviderService } from '~/features/util/provider/provider.service';
import { ProposalEvent } from '../proposals/proposals.args';
import { ProposalsService } from '../proposals/proposals.service';
import { Prisma } from '@prisma/client';

export interface TransactionResponseJob {
  transactionHash: string;
}

@Injectable()
export class TransactionsService {
  static readonly QUEUE_OPTIONS = {
    name: 'Transactions',
    defaultJobOptions: {
      attempts: 15, // 2^15 * 200ms = ~1.8h
      backoff: { type: 'exponential', delay: 200 },
    },
  } satisfies BullModuleOptions;

  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    @InjectQueue(TransactionsService.QUEUE_OPTIONS.name)
    private responseQueue: Queue<TransactionResponseJob>,
    @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
  ) {
    this.addMissingResponseJobs();
  }

  async tryExecute<T extends Prisma.ProposalArgs>(
    proposalId: string,
    res?: Prisma.SelectSubset<T, Prisma.ProposalArgs>,
  ) {
    const proposal = await this.prisma.asUser.proposal.findUniqueOrThrow({
      where: { id: proposalId },
      include: {
        approvals: {
          select: {
            userId: true,
            signature: true,
          },
        },
        quorum: {
          select: {
            activeState: {
              include: {
                approvers: { select: { userId: true } },
                limits: true,
              },
            },
          },
        },
      },
    });

    const quorum = proposal.quorum.activeState;
    if (!quorum) return undefined;

    const signers: Signer[] = proposal.approvals
      .filter((approval) => approval.signature)
      .map((approval) => ({
        approver: address(approval.userId),
        signature: approval.signature!, // Rejections are filtered out
      }));

    if (quorum.approvers.length < signers.length) return undefined;

    const transaction = await executeTx({
      account: this.provider.connectAccount(address(proposal.accountId)),
      tx: toTx({
        to: address(proposal.to),
        value: proposal.value ? BigNumber.from(proposal.value) : undefined,
        data: proposal.data ?? undefined,
        salt: toTxSalt(proposal.salt),
        gasLimit: proposal.gasLimit ? BigNumber.from(proposal.gasLimit.toString()) : undefined,
      }),
      quorum: {
        key: toQuorumKey(quorum.quorumKey),
        approvers: new Set(quorum.approvers.map((a) => address(a.userId))),
        spending: {
          fallback: quorum.spendingFallback,
          limits: Object.fromEntries(
            quorum.limits
              .map(
                (l): TokenLimit => ({
                  token: address(l.token),
                  amount: BigNumber.from(l.amount),
                  period: l.period as TokenLimitPeriod,
                }),
              )
              .map((l) => [l.token, l]),
          ),
        },
      },
      signers,
    });

    const { proposal: updatedProposal } = await this.prisma.asUser.transaction.create({
      data: {
        proposal: { connect: { id: proposalId } },
        hash: transaction.hash,
        nonce: transaction.nonce,
        gasLimit: transaction.gasLimit.toString(),
        gasPrice: transaction.gasPrice?.toString(),
      },
      select: {
        proposal: { ...res } ?? { select: { id: true } },
      },
    });
    this.proposals.publishProposal({ proposal: updatedProposal, event: ProposalEvent.update });

    this.responseQueue.add({ transactionHash: transaction.hash }, { delay: 1000 /* 1s */ });

    return updatedProposal as Prisma.ProposalGetPayload<T>;
  }

  private async addMissingResponseJobs() {
    const jobs = await this.responseQueue.getJobs(['waiting', 'active', 'delayed', 'paused']);

    const missingResponses = await this.prisma.asSuperuser.transaction.findMany({
      where: {
        response: null,
        hash: { notIn: jobs.map((job) => job.data.transactionHash) },
      },
      select: {
        hash: true,
      },
    });

    return this.responseQueue.addBulk(
      missingResponses.map((r) => ({ data: { transactionHash: r.hash } })),
    );
  }
}
