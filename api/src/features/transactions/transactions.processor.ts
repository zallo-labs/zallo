import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TransactionEvent, TRANSACTIONS_QUEUE } from './transactions.queue';
import { ProviderService } from '../util/provider/provider.service';
import { Log, TransactionReceipt } from '@ethersproject/abstract-provider';

export interface TransactionData {
  receipt: TransactionReceipt;
}

export type TransactionListener = (data: TransactionData) => Promise<void>;

export interface TransactionEventData {
  log: Log;
  receipt: TransactionReceipt;
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

    await Promise.all(
      receipt.logs.flatMap((log) =>
        this.eventListeners.get(log.topics[0])?.map((listener) => listener({ log, receipt })),
      ),
    );
  }

  @OnQueueFailed()
  onFailed(job: Job<TransactionEvent>, error: unknown) {
    Logger.error('Transactions queue job failed', { job, error });
  }
}
