import { BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { asAddress, Approval, executeTx } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProviderService } from '~/features/util/provider/provider.service';
import { ProposalEvent } from '../proposals/proposals.args';
import { ProposalsService } from '../proposals/proposals.service';
import { Prisma } from '@prisma/client';
import { PoliciesService } from '../policies/policies.service';

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
    @Inject(forwardRef(() => PoliciesService))
    private policies: PoliciesService,
  ) {
    this.addMissingResponseJobs();
  }

  async tryExecute<T extends Prisma.ProposalArgs>(
    proposalId: string,
    res?: Prisma.SelectSubset<T, Prisma.ProposalArgs>,
  ) {
    const policy = await this.policies.getFirstSatisfiedPolicy(proposalId);
    if (!policy) return undefined;

    const proposal = await this.prisma.asUser.proposal.findUniqueOrThrow({
      where: { id: proposalId },
      include: {
        approvals: {
          select: {
            userId: true,
            signature: true,
          },
        },
      },
    });

    const approvals: Approval[] = proposal.approvals
      .filter((approval) => approval.signature)
      .map((approval) => ({
        approver: asAddress(approval.userId),
        signature: approval.signature!, // Rejections are filtered out
      }));

    const transaction = await executeTx({
      account: this.provider.connectAccount(asAddress(proposal.accountId)),
      tx: {
        to: asAddress(proposal.to),
        value: proposal.value ? BigInt(proposal.value.toString()) : undefined,
        data: proposal.data ?? undefined,
        nonce: proposal.nonce,
        gasLimit: proposal.gasLimit || undefined,
      },
      policy,
      approvals,
    });

    const { proposal: updatedProposal } = await this.prisma.asUser.transaction.create({
      data: {
        proposal: { connect: { id: proposalId } },
        hash: transaction.hash,
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
