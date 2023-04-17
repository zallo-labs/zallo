import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../util/prisma/prisma.service';
import { ProposalEvent } from '../proposals/proposals.args';
import { ProposalsService } from '../proposals/proposals.service';
import { SubgraphService, SubgraphTransactionResponse } from '../subgraph/subgraph.service';
import { TransactionEvent, TRANSACTIONS_QUEUE } from './transactions.queue';
import { ExplorerService } from '../explorer/explorer.service';
import { ProviderService } from '../util/provider/provider.service';
import { Hex } from 'lib';

export interface TransactionResponseData {
  transactionHash: Hex;
  response: SubgraphTransactionResponse;
}

export type TransactionResponseProcessor = (data: TransactionResponseData) => Promise<void>;

const TRANSACTION_NOT_FOUND = 'Transaction not found';
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
    private provider: ProviderService,
    private explorer: ExplorerService,
  ) {}

  @OnQueueFailed()
  onFailed(job: Job<TransactionEvent>, error: unknown) {
    if (job.failedReason !== RESPONSE_NOT_FOUND) console.warn('Job failed', { job, error });
  }

  @Process()
  async process(job: Job<TransactionEvent>) {
    const { transactionHash } = job.data;

    const [receipt, transfers, response] = await Promise.all([
      this.provider.getTransactionReceipt(transactionHash),
      this.explorer.transactionTransfers(transactionHash),
      this.subgraph.transactionResponse(job.data.transactionHash),
    ]);
    if (!receipt) return job.moveToFailed({ message: TRANSACTION_NOT_FOUND });
    if (!transfers) return job.moveToFailed({ message: TRANSACTION_NOT_FOUND });
    if (!response) return job.moveToFailed({ message: RESPONSE_NOT_FOUND });

    const createResponse = this.prisma.asSystem.transactionResponse.create({
      data: {
        transactionHash,
        success: response.success,
        response: response.response,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString(),
        timestamp: new Date(parseFloat(response.timestamp) * 1000),
        transfers: {
          createMany: {
            data: transfers.map((t) => ({
              transferNumber: 0, // TODO: get transfer number from explorer
              token: t.token,
              from: t.from,
              to: t.to,
              amount: t.amount.toString(),
            })),
          },
        },
      },
      select: {
        transaction: {
          include: {
            proposal: true,
          },
        },
      },
    });

    const data: TransactionResponseData = { transactionHash, response };
    const [{ transaction }] = await Promise.all([
      createResponse,
      ...Object.values(this.processors).map((processor) => processor(data)),
    ]);

    await this.proposals.publishProposal({
      proposal: transaction.proposal,
      event: ProposalEvent.response,
    });
  }

  addProcessor(key: string, processor: TransactionResponseProcessor) {
    if (this.processors[key]) throw new Error(`Processor with key='${key}' already exists`);
    this.processors[key] = processor;
  }
}
