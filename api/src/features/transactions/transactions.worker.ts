import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { AbiEvent } from 'abitype';
import { encodeEventTopics, FormattedBlock, FormattedTransactionReceipt, Hex } from 'viem';

import { Chain, ChainConfig } from 'chains';
import { Log } from '~/features/events/events.worker';
import { TypedJob, Worker } from '~/features/util/bull/bull.util';
import { NetworksService } from '../util/networks/networks.service';
import { TRANSACTIONS_QUEUE } from './transactions.queue';

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
export class TransactionsWorker extends Worker<typeof TRANSACTIONS_QUEUE> {
  private listeners: TransactionListener[] = [];
  private eventListeners = new Map<Hex, TransactionEventListener[]>();

  constructor(private networks: NetworksService) {
    super();
  }

  onTransaction(listener: TransactionListener) {
    this.listeners.push(listener);
  }

  onEvent(event: AbiEvent, listener: TransactionEventListener) {
    const topic = encodeEventTopics({ abi: [event] })[0];
    this.eventListeners.set(topic, [...(this.eventListeners.get(topic) ?? []), listener]);
  }

  async process(job: TypedJob<typeof TRANSACTIONS_QUEUE>) {
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
}
