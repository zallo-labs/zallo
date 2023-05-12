import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TransactionEvent, TRANSACTIONS_QUEUE } from './transactions.queue';
import { ProviderService } from '../util/provider/provider.service';
import { Log, TransactionReceipt } from '@ethersproject/abstract-provider';
import { Block } from 'zksync-web3/build/src/types';

export interface TransactionData {
  receipt: TransactionReceipt;
  block: Block;
}

export type TransactionListener = (data: TransactionData) => Promise<void>;

export interface TransactionEventData extends TransactionData {
  log: Log;
}

export type TransactionEventListener = (data: TransactionEventData) => Promise<void>;

@Injectable()
@Processor(TRANSACTIONS_QUEUE.name)
export class TransactionsProcessor {
  private listeners: TransactionListener[] = [];
  private eventListeners = new Map<string, TransactionEventListener[]>();

  constructor(private provider: ProviderService) {}

  onTransaction(listener: TransactionListener) {
    this.listeners.push(listener);
  }

  onEvent(topic: string, listener: TransactionEventListener) {
    this.eventListeners.set(topic, [...(this.eventListeners.get(topic) ?? []), listener]);
  }

  @Process()
  async process(job: Job<TransactionEvent>) {
    const { transaction: transactionHash } = job.data;

    const receipt = await this.provider.waitForTransaction(transactionHash, 1, 10000);
    const block = await this.provider.getBlock(receipt.blockHash);

    await Promise.all([
      ...this.listeners.map((listener) => listener({ receipt, block })),
      ...receipt.logs.flatMap((log) =>
        this.eventListeners
          .get(log.topics[0])
          ?.map((listener) => listener({ log, receipt, block })),
      ),
    ]);
  }

  @OnQueueFailed()
  onFailed(job: Job<TransactionEvent>, error: unknown) {
    Logger.error('Transactions queue job failed', { job, error });
  }
}
