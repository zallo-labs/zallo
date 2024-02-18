import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EventData, EventsWorker } from '../events/events.worker';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { getAbiItem } from 'viem';
import { ACCOUNT_IMPLEMENTATION, asUAddress } from 'lib';
import e from '~/edgeql-js';
import { TransactionsWorker } from './transactions.worker';

const scheduledEvent = getAbiItem({ abi: ACCOUNT_IMPLEMENTATION.abi, name: 'Scheduled' });
const scheduleCancelledEvent = getAbiItem({
  abi: ACCOUNT_IMPLEMENTATION.abi,
  name: 'ScheduleCancelled',
});

@Injectable()
export class SchedulerEvents {
  constructor(
    private db: DatabaseService,
    private eventsProcessor: EventsWorker,
    private transactionsProcessor: TransactionsWorker,
    private accountsCache: AccountsCacheService,
  ) {
    this.eventsProcessor.on(scheduledEvent, (event) => this.onScheduled(event));
    this.transactionsProcessor.onEvent(scheduledEvent, (event) => this.onScheduled(event));

    this.eventsProcessor.on(scheduleCancelledEvent, (event) => this.onScheduleCancelled(event));
    this.transactionsProcessor.onEvent(scheduleCancelledEvent, (event) => this.onScheduleCancelled(event));
  }

  private async onScheduled(event: EventData<typeof scheduledEvent>) {
    const account = asUAddress(event.log.address, event.chain);
    if (!(await this.accountsCache.isAccount(account))) return;

    await this.db.query(
      e.update(e.Transaction, () => ({
        filter_single: { hash: event.log.transactionHash },
        set: { scheduledFor: new Date(Number(event.log.args.timestamp) * 1000) },
      })),
    );
  }

  private async onScheduleCancelled(event: EventData<typeof scheduleCancelledEvent>) {
    const account = asUAddress(event.log.address, event.chain);
    if (!(await this.accountsCache.isAccount(account))) return;

    await this.db.query(
      e.update(e.Transaction, () => ({
        filter_single: { hash: event.log.transactionHash },
        set: { cancelled: true },
      })),
    );
  }
}
