import { Process, Processor } from '@nestjs/bull';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProposalEvent } from '../proposals/proposals.args';
import { ProposalsService } from '../proposals/proposals.service';
import { SubgraphService } from '../subgraph/subgraph.service';
import { TransactionResponseJob, TransactionsService } from './transactions.service';
import { TransactionResponse } from '@prisma/client';

export type TransactionResponseProcessor = (resp: TransactionResponse) => Promise<void>;

@Injectable()
@Processor(TransactionsService.QUEUE_OPTIONS.name)
export class TransactionsConsumer {
  private processors: Record<string, TransactionResponseProcessor> = {};

  constructor(
    private prisma: PrismaService,
    private subgraph: SubgraphService,
    @Inject(forwardRef(() => ProposalsService))
    private proposals: ProposalsService,
  ) {}

  @Process()
  async process(job: Job<TransactionResponseJob>) {
    const response = await this.subgraph.transactionResponse(job.data.transactionHash);
    if (!response) return job.moveToFailed({ message: 'Transaction response not found' });

    await Promise.all(Object.values(this.processors).map((processor) => processor(response)));

    const { transaction } = await this.prisma.asSuperuser.transactionResponse.create({
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
