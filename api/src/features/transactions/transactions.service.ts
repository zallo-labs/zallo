import { InjectQueue } from '@nestjs/bull';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { asAddress, executeTx, asHex, mapAsync, isPresent } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProviderService } from '~/features/util/provider/provider.service';
import { PROPOSAL_PAYLOAD_SELECT, ProposalEvent } from '../proposals/proposals.args';
import { ProposalsService } from '../proposals/proposals.service';
import { Prisma } from '@prisma/client';
import { PoliciesService } from '../policies/policies.service';
import { TransactionEvent, TRANSACTIONS_QUEUE } from './transactions.queue';
import merge from 'ts-deepmerge';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private provider: ProviderService,
    @InjectQueue(TRANSACTIONS_QUEUE.name)
    private transactionsQueue: Queue<TransactionEvent>,
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
    const policy = (await this.policies.satisifiedPolicies(proposalId).next()).value;
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

    const approvals = (
      await mapAsync(
        proposal.approvals.filter((approval) => approval.signature),
        (approval) =>
          this.provider.asApproval({
            digest: proposalId,
            approver: asAddress(approval.userId),
            signature: asHex(approval.signature!),
          }),
      )
    ).filter(isPresent);

    if (approvals.length !== proposal.approvals.length) {
      // TODO: remove now invalid approvals
      return undefined;
    }

    const transaction = await executeTx({
      account: this.provider.connectAccount(asAddress(proposal.accountId)),
      tx: {
        to: asAddress(proposal.to),
        value: proposal.value ? BigInt(proposal.value.toString()) : undefined,
        data: asHex(proposal.data ?? undefined),
        nonce: proposal.nonce,
        gasLimit: proposal.gasLimit || undefined,
      },
      policy,
      approvals,
    });

    const transactionHash = asHex(transaction.hash);
    const { proposal: updatedProposal } = await this.prisma.asUser.transaction.create({
      data: {
        proposal: { connect: { id: proposalId } },
        hash: transactionHash,
        gasLimit: transaction.gasLimit.toString(),
        gasPrice: transaction.gasPrice?.toString(),
      },
      select: {
        proposal: {
          select: merge(res?.select ?? {}, PROPOSAL_PAYLOAD_SELECT),
        },
      },
    });
    this.proposals.publishProposal({ proposal: updatedProposal, event: ProposalEvent.update });

    this.transactionsQueue.add({ transactionHash }, { delay: 1000 /* 1s */ });

    return updatedProposal as Prisma.ProposalGetPayload<T>;
  }

  private async addMissingResponseJobs() {
    const jobs = await this.transactionsQueue.getJobs(['waiting', 'active', 'delayed', 'paused']);

    const missingResponses = await this.prisma.asSystem.transaction.findMany({
      where: {
        response: null,
        hash: { notIn: jobs.map((job) => job.data.transactionHash) },
      },
      select: {
        hash: true,
      },
    });

    return this.transactionsQueue.addBulk(
      missingResponses.map((r) => ({ data: { transactionHash: asHex(r.hash) } })),
    );
  }
}
