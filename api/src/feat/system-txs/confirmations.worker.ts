import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ConfirmationQueue } from './confirmations.queue';
import { NetworksService } from '~/core/networks/networks.service';
import { Chain, ChainConfig } from 'chains';
import { FormattedTransactionReceipt } from 'viem';
import { AbiEvent } from 'abitype';
import { TypedJob } from '~/core/bull/bull.util';
import { Worker } from '~/core/bull/Worker';
import { isHex } from 'lib';
import { EventsService, Log } from '../events/events.service';

export type Receipt = FormattedTransactionReceipt<ChainConfig>;
export interface ConfirmationData {
  chain: Chain;
  receipt: Receipt;
}

export type ConfirmationListener = (data: ConfirmationData) => Promise<unknown>;

export interface ConfirmationEventData<TAbiEvent extends AbiEvent> extends ConfirmationData {
  log: Log<TAbiEvent>;
}

@Injectable()
@Processor(ConfirmationQueue.name, { autorun: false })
export class ConfirmationsWorker extends Worker<ConfirmationQueue> {
  private listeners: ConfirmationListener[] = [];

  constructor(
    private networks: NetworksService,
    private events: EventsService,
  ) {
    super();
  }

  on(listener: ConfirmationListener) {
    this.listeners.push(listener);
  }

  async process(job: TypedJob<ConfirmationQueue>) {
    const { chain } = job.data;
    const transaction = isHex(job.data.transaction)
      ? job.data.transaction
      : await (async () => {
          const v =
            typeof job.data.transaction === 'object' &&
            Object.values(await job.getChildrenValues())[job.data.transaction.child];

          return isHex(v) ? v : undefined;
        })();
    if (!transaction) return;

    await job.updateData({ ...job.data, transaction });

    const network = this.networks.get(chain);
    const receipt = await network.waitForTransactionReceipt({
      hash: transaction,
      timeout: 60_000,
      pollingInterval: 1_000,
    });

    await Promise.all([
      ...this.listeners.map((listener) => listener({ chain, receipt })),
      this.events.processConfirmed({
        chain,
        logs: receipt.logs as unknown as Log<AbiEvent, true>[],
        receipt,
      }),
    ]);
  }
}
