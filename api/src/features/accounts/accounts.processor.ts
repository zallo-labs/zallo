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
import { and } from '../database/database.util';

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
      this.networks.for(account).provider.getTransactionReceipt(transaction),
    );
    if (!receipt) return job.moveToFailed({ message: 'Transaction receipt not found' });

    if (receipt.status !== 1) {
      // TODO: handle failed activation
      Logger.error('Account activation transaction failed', { account, transaction });
      return;
    }

    await this.db.transaction(async (db) => {
      await e
        .select({
          account: e.update(e.Account, () => ({
            filter_single: { address: account },
            set: {
              isActive: true,
            },
          })),
          policyState: e.update(e.PolicyState, (ps) => ({
            filter: and(
              e.op(ps.policy.account.address, '=', account),
              e.op(ps.isAccountInitState, '=', true),
            ),
            set: {
              activationBlock: BigInt(receipt.blockNumber),
            },
          })),
        })
        .run(db);
    });

    await this.accounts.publishAccount({ account, event: AccountEvent.update });
  }
}
