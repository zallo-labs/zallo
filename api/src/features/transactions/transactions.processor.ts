import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TransactionEvent, TRANSACTIONS_QUEUE } from './transactions.queue';
import { NetworksService } from '../util/networks/networks.service';
import { Chain, ChainConfig } from 'chains';
import { FormattedBlock, FormattedTransactionReceipt, Hex, encodeEventTopics } from 'viem';
import { AbiEvent } from 'abitype';
import { Log } from '~/features/events/events.processor';

export const REQUIRED_CONFIRMATIONS = 1;

export interface TransactionData {
  chain: Chain;
  receipt: FormattedTransactionReceipt<ChainConfig>;
  block: FormattedBlock<ChainConfig, false>;
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
  private eventListeners = new Map<Hex, TransactionEventListener[]>();

  constructor(private networks: NetworksService) {}

  onTransaction(listener: TransactionListener) {
    this.listeners.push(listener);
  }

  onEvent(event: AbiEvent, listener: TransactionEventListener) {
    const topic = encodeEventTopics({ abi: [event] })[0];
    this.eventListeners.set(topic, [...(this.eventListeners.get(topic) ?? []), listener]);
  }

  @Process()
  async process(job: Job<TransactionEvent>) {
    const { chain, transaction: transactionHash } = job.data;

    const network = this.networks.get(chain);
    const receipt = await network.waitForTransactionReceipt({
      hash: transactionHash,
      confirmations: REQUIRED_CONFIRMATIONS,
      timeout: 60_000,
      pollingInterval: 2_000,
    });
    const block = await network.getBlock({ blockNumber: receipt.blockNumber });

    await Promise.all([
      ...this.listeners.map((listener) => listener({ chain, receipt, block })),
      ...receipt.logs
        .filter((log) => log.topics)
        .flatMap(
          (log) =>
            this.eventListeners
              .get(log.topics[0]!)
              ?.map((listener) => listener({ chain, log: log as unknown as Log, receipt, block })),
        ),
    ]);
  }

  @OnQueueFailed()
  onFailed(job: Job<TransactionEvent>, error: unknown) {
    Logger.error('Transactions queue job failed', { job, error });
  }
}
