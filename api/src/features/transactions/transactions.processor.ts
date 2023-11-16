import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TransactionEvent, TRANSACTIONS_QUEUE } from './transactions.queue';
import { NetworksService } from '../util/networks/networks.service';
import { Log, TransactionReceipt } from '@ethersproject/abstract-provider';
import { Block } from 'zksync-web3/build/src/types';
import { Chain } from 'lib';

export interface TransactionData {
  chain: Chain;
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

  constructor(private networks: NetworksService) {}

  onTransaction(listener: TransactionListener) {
    this.listeners.push(listener);
  }

  onEvent(topic: string, listener: TransactionEventListener) {
    this.eventListeners.set(topic, [...(this.eventListeners.get(topic) ?? []), listener]);
  }

  @Process()
  async process(job: Job<TransactionEvent>) {
    const { chain, transaction: transactionHash } = job.data;

    const network = this.networks.get(chain);
    const receipt = await network.provider.waitForTransaction(transactionHash, 1, 10000);
    const block = await network.provider.getBlock(receipt.blockHash);

    await Promise.all([
      ...this.listeners.map((listener) => listener({ chain, receipt, block })),
      ...receipt.logs.flatMap(
        (log) =>
          this.eventListeners
            .get(log.topics[0])
            ?.map((listener) => listener({ chain, log, receipt, block })),
      ),
    ]);
  }

  @OnQueueFailed()
  onFailed(job: Job<TransactionEvent>, error: unknown) {
    Logger.error('Transactions queue job failed', { job, error });
  }
}
