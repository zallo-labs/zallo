import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NetworksService } from '../util/networks/networks.service';
import { AccountsService } from './accounts.service';
import { AccountEvent } from './accounts.input';
import { ACCOUNTS_QUEUE, AccountActivationEvent } from './accounts.queue';
import { tryOrIgnoreAsync } from 'lib';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';

@Injectable()
@Processor(ACCOUNTS_QUEUE.name)
export class AccountsProcessor {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private accounts: AccountsService,
  ) {}

  @OnQueueFailed()
  onFailed(job: Job<AccountActivationEvent>, error: unknown) {
    Logger.error('Account queue job failed', { job, error });
  }

  @Process()
  async process(job: Job<AccountActivationEvent>) {
    const { account, transaction } = job.data;

    const receipt = await tryOrIgnoreAsync(() =>
      this.networks.for(account).getTransactionReceipt({ hash: transaction }),
    );
    if (!receipt) return job.moveToFailed({ message: 'Transaction receipt not found' });

    if (receipt.status === 'reverted') {
      // TODO: handle failed activation
      Logger.error('Account activation transaction failed', { account, transaction });
      return;
    }

    await this.db.query(
      e.update(e.Account, () => ({
        filter_single: { address: account },
        set: {
          isActive: true,
        },
      })),
    );

    await this.accounts.publishAccount({ account, event: AccountEvent.update });
  }
}
