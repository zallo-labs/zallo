import { Injectable, Logger } from '@nestjs/common';
import { asUAddress, tryOrIgnore, ACCOUNT_PROXY } from 'lib';
import { TransactionEventData, TransactionsWorker } from '../transactions/transactions.worker';
import { EventData, EventsWorker } from '../events/events.worker';
import { DatabaseService } from '../database/database.service';
import { selectAccount } from '../accounts/accounts.util';
import { decodeEventLog, getAbiItem } from 'viem';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { ampli } from '~/util/ampli';
import { AccountsService } from '~/features/accounts/accounts.service';
import { AccountEvent } from '~/features/accounts/accounts.input';
import e from '~/edgeql-js';

@Injectable()
export class UpgradeEvents {
  private log = new Logger(this.constructor.name);

  constructor(
    private db: DatabaseService,
    private eventsWorker: EventsWorker,
    private transactionsWorker: TransactionsWorker,
    private accounts: AccountsService,
    private accountsCache: AccountsCacheService,
  ) {
    const upgradedEvent = getAbiItem({ abi: ACCOUNT_PROXY.abi, name: 'Upgraded' });
    this.eventsWorker.on(upgradedEvent, (data) => this.upgraded(data));
    this.transactionsWorker.onEvent(upgradedEvent, (data) => this.upgraded(data));
  }

  private async upgraded(event: EventData | TransactionEventData) {
    const implementation = tryOrIgnore(
      () =>
        decodeEventLog({
          abi: ACCOUNT_PROXY.abi,
          eventName: 'Upgraded',
          data: event.log.data,
          topics: event.log.topics,
        }).args.implementation,
    );
    if (!implementation) return;

    const address = asUAddress(event.log.address, event.chain);
    if (!(await this.accountsCache.isAccount(address))) return;

    const selectedAccount = selectAccount(address);
    const shouldUpdate = e.op(
      e.op(selectedAccount.upgradedAtBlock, '<', event.log.blockNumber),
      '??',
      true,
    );
    const updateAccount = e.update(selectedAccount, () => ({
      set: {
        implementation,
        upgradedAtBlock: event.log.blockNumber,
      },
    }));
    const updatedAccount = e.op(updateAccount, 'if', shouldUpdate, 'else', selectedAccount);

    const { activated, updated, account } = await this.db.query(
      e.select({
        activated: e.op('not', selectedAccount.isActive),
        updated: shouldUpdate,
        account: e.select(updatedAccount, () => ({
          approvers: { user: true },
        })),
      }),
    );
    if (!updated) return;

    this.log.debug(`Account ${address} upgraded to ${implementation}`);
    await this.accounts.publishAccount({ account: address, event: AccountEvent.update });
    if (activated) {
      account?.approvers.forEach(({ user }) => ampli.accountActivated(user.id));
    }
  }
}
