import { Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { NetworksService } from '../util/networks/networks.service';
import { AccountsService } from './accounts.service';
import { AccountEvent } from './accounts.input';
import { ACTIVATIONS_QUEUE } from './activations.queue';
import { tryOrIgnoreAsync } from 'lib';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { Worker, TypedJob } from '~/features/util/bull/bull.util';
import { ampli } from '~/util/ampli';

@Injectable()
@Processor(ACTIVATIONS_QUEUE.name)
export class ActivationsWorker extends Worker<typeof ACTIVATIONS_QUEUE> {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private accounts: AccountsService,
  ) {
    super();
  }

  async process(job: TypedJob<typeof ACTIVATIONS_QUEUE>) {
    const { account, transaction } = job.data;

    const receipt = await tryOrIgnoreAsync(() =>
      this.networks.get(account).getTransactionReceipt({ hash: transaction }),
    );
    if (!receipt) throw new Error('Transaction receipt not found');

    if (receipt.status === 'reverted') {
      // TODO: handle failed activation
      this.log.error('Account activation transaction failed', { account, transaction });
      return;
    }

    const updateAccount = e.update(e.Account, () => ({
      filter_single: { address: account },
      set: {
        isActive: true,
      },
    }));

    const users = await this.db.query(
      e.select(updateAccount, () => ({
        approvers: { user: true },
      })).approvers.user,
    );

    await this.accounts.publishAccount({ account, event: AccountEvent.update });
    users.forEach((user) => ampli.accountActivated(user.id));
  }
}
