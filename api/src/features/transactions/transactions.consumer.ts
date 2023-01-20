import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from 'nestjs-prisma';
import { ProposalsService } from '../proposals/proposals.service';
import { SubgraphService } from '../subgraph/subgraph.service';
import { TransactionResponseJob, TransactionsService } from './transactions.service';

@Processor(TransactionsService.QUEUE_NAME)
export class TransactionsConsumer {
  constructor(
    private prisma: PrismaService,
    private subgraph: SubgraphService,
    private proposals: ProposalsService,
  ) {}

  @Process()
  async process(job: Job<TransactionResponseJob>) {
    const response = await this.subgraph.transactionResponse(job.data.transactionHash);
    if (!response) return job.moveToFailed({ message: 'Transaction response not found' });

    const {
      transaction: { proposal },
    } = await this.prisma.transactionResponse.create({
      data: response,
      select: {
        transaction: {
          select: {
            proposal: true,
          },
        },
      },
    });
    this.proposals.publishProposal(proposal);
  }
}
