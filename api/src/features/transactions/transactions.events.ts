import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../util/prisma/prisma.service';
import { ACCOUNT_INTERFACE as ACCOUNT, Address, Hex, asAddress, asHex } from 'lib';
import { BytesLike } from 'ethers';
import { hexDataLength } from 'ethers/lib/utils';
import { ProposalsService } from '../proposals/proposals.service';
import { ProposalEvent } from '../proposals/proposals.args';
import {
  TransactionData,
  TransactionEventData,
  TransactionsProcessor,
} from './transactions.processor';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { InjectQueue } from '@nestjs/bull';
import { TRANSACTIONS_QUEUE, TransactionEvent } from './transactions.queue';
import { Queue } from 'bull';

@Injectable()
export class TransactionsEvents implements OnModuleInit {
  constructor(
    @InjectQueue(TRANSACTIONS_QUEUE.name)
    private queue: Queue<TransactionEvent>,
    private transactionsProcessor: TransactionsProcessor,
    private prisma: PrismaService,
    private proposals: ProposalsService,
  ) {
    this.transactionsProcessor.onEvent(
      ACCOUNT.getEventTopic(ACCOUNT.events['TransactionExecuted(bytes32,bytes)']),
      this.executed,
    );
    this.transactionsProcessor.onTransaction(this.reverted);
  }

  onModuleInit() {
    this.addMissingJobs();
  }

  private async executed({ log, receipt }: TransactionEventData) {
    const r = ACCOUNT.decodeEventLog(
      ACCOUNT.events['TransactionExecuted(bytes32,bytes)'],
      log.data,
      log.topics,
    );
    const [proposalId, response] = [asHex(r[0] as BytesLike), asHex(r[1] as BytesLike)];

    await this.prisma.asSystem.transactionReceipt.create({
      data: {
        transactionHash: asHex(receipt.transactionHash),
        success: true,
        response: hexDataLength(response) ? response : null,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.effectiveGasPrice.toString(),
        fee: 0,
        blockNumber: receipt.blockNumber,
      },
      select: null,
    });

    await this.proposals.publishProposal({
      proposal: { accountId: asAddress(log.address), id: proposalId },
      event: ProposalEvent.response,
    });
  }

  private async reverted({ receipt }: TransactionData) {
    if (receipt.status !== 0) return;

    const { transaction } = await this.prisma.asSystem.transactionReceipt.create({
      data: {
        transactionHash: asHex(receipt.transactionHash),
        success: false,
        response: null,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.effectiveGasPrice.toString(),
        fee: 0,
        blockNumber: receipt.blockNumber,
      },
      select: {
        transaction: {
          select: {
            proposalId: true,
          },
        },
      },
    });

    await this.proposals.publishProposal({
      proposal: { accountId: asAddress(receipt.contractAddress), id: transaction.proposalId },
      event: ProposalEvent.response,
    });
  }

  private async addMissingJobs() {
    const jobs = await this.queue.getJobs(['waiting', 'active', 'delayed', 'paused']);

    const missingResponses = await this.prisma.asSystem.transaction.findMany({
      where: {
        receipt: null,
        hash: { notIn: jobs.map((job) => job.data.transaction) },
      },
      select: {
        hash: true,
      },
    });

    return this.queue.addBulk(
      missingResponses.map((r) => ({ data: { transaction: asHex(r.hash) } })),
    );
  }
}
