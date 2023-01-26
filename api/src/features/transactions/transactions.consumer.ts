import { Process, Processor } from '@nestjs/bull';
import { forwardRef, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProposalEvent } from '../proposals/proposals.args';
import { ProposalsService } from '../proposals/proposals.service';
import { QuorumsService } from '../quorums/quorums.service';
import { SubgraphService } from '../subgraph/subgraph.service';
import { TransactionResponseJob, TransactionsService } from './transactions.service';

@Processor(TransactionsService.QUEUE_OPTIONS.name)
export class TransactionsConsumer {
  constructor(
    private prisma: PrismaService,
    private subgraph: SubgraphService,
    @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
    @Inject(forwardRef(() => QuorumsService))
    private quorums: QuorumsService,
  ) {}

  @Process()
  async process(job: Job<TransactionResponseJob>) {
    const response = await this.subgraph.transactionResponse(job.data.transactionHash);
    if (!response) return job.moveToFailed({ message: 'Transaction response not found' });

    if (response.success) this.quorums.handleSuccessfulTransaction(response.transactionHash);

    const { transaction } = await this.prisma.transactionResponse.create({
      data: response,
      select: {
        transaction: {
          select: {
            proposal: true,
          },
        },
      },
    });

    this.proposals.publishProposal({
      proposal: transaction.proposal,
      event: ProposalEvent.response,
    });
  }
}
