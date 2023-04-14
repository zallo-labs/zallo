import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProposalEvent } from '../proposals/proposals.args';
import { ProposalsService } from '../proposals/proposals.service';
import { SubgraphService } from '../subgraph/subgraph.service';
import { TransactionResponse } from '@prisma/client';
import { TransactionEvent, TRANSACTIONS_QUEUE } from './transactions.queue';

export type TransactionResponseProcessor = (resp: TransactionResponse) => Promise<void>;

const RESPONSE_NOT_FOUND = 'Transaction response not found';

@Injectable()
@Processor(TRANSACTIONS_QUEUE.name)
export class TransactionsConsumer {
  private processors: Record<string, TransactionResponseProcessor> = {};

  constructor(
    private prisma: PrismaService,
    private subgraph: SubgraphService,
    @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
  ) {}

  @OnQueueFailed()
  onFailed(job: Job<TransactionEvent>, error: unknown) {
    if (job.failedReason !== RESPONSE_NOT_FOUND)
      console.warn('Job failed', { job: job.data.transactionHash, error });
  }

  @Process()
  async process(job: Job<TransactionEvent>) {
    const response = await this.subgraph.transactionResponse(job.data.transactionHash);
    if (!response) return job.moveToFailed({ message: RESPONSE_NOT_FOUND });

    await Promise.all(Object.values(this.processors).map((processor) => processor(response)));

    const { transaction } = await this.prisma.asSystem.transactionResponse.create({
      data: response,
      select: {
        transaction: {
          include: {
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

  addProcessor(key: string, processor: TransactionResponseProcessor) {
    if (this.processors[key]) throw new Error(`Processor with key='${key}' already exists`);
    this.processors[key] = processor;
  }
}
