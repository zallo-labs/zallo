import { Injectable, Logger } from '@nestjs/common';
import { asUAddress, ACCOUNT_PROXY, asDecimal } from 'lib';
import { DatabaseService } from '~/core/database';
import { selectAccount } from './accounts.util';
import { getAbiItem } from 'viem';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { ampli } from '~/util/ampli';
import { AccountsService } from '~/feat/accounts/accounts.service';
import e from '~/edgeql-js';
import { ETH } from 'lib/dapps';
import { AccountEvent } from './accounts.model';
import { ConfirmedEvent, EventsService } from '../events/events.service';
import { NetworksService } from '~/core/networks';

const upgradedEvent = getAbiItem({ abi: ACCOUNT_PROXY.abi, name: 'Upgraded' });

@Injectable()
export class UpgradeEvents {
  private log = new Logger(this.constructor.name);

  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private events: EventsService,
    private accounts: AccountsService,
    private accountsCache: AccountsCacheService,
  ) {
    this.events.onConfirmed(upgradedEvent, (data) => this.upgraded(data));
  }

  private async upgraded(event: ConfirmedEvent<typeof upgradedEvent>) {
    const { implementation } = event.log.args;
    const address = asUAddress(event.log.address, event.chain);
    if (!(await this.accountsCache.isAccount(address))) return;

    const receipt =
      event.receipt ?? 
      (await this.networks
        .get(event.chain)
        .getTransactionReceipt({ hash: event.log.transactionHash }));

    const selectedAccount = selectAccount(address);
    const shouldUpdate = e.op(
      e.op(selectedAccount.upgradedAtBlock, '<', event.log.blockNumber),
      '??',
      true,
    );
    const updateAccount = e.update(selectedAccount, (a) => ({
      set: {
        implementation,
        upgradedAtBlock: event.log.blockNumber,
        activationEthFee: e.op(
          e.decimal(asDecimal(receipt.gasUsed * receipt.effectiveGasPrice, ETH).toString()),
          'if',
          e.op('not', a.active),
          'else',
          e.cast(e.decimal, e.set()),
        ),
      },
    }));
    const updatedAccount = e.op(updateAccount, 'if', shouldUpdate, 'else', selectedAccount);

    const { activated, updated, users } = await this.db.query(
      e.select({
        activated: e.op('not', selectedAccount.active),
        updated: shouldUpdate,
        users: updatedAccount.approvers.user,
      }),
    );
    if (!updated) return;

    this.log.debug(`Account ${address} upgraded to ${implementation}`);
    await this.accounts.event({ account: address, event: AccountEvent.upgraded });
    if (activated) {
      users.forEach((user) => ampli.accountActivated(user.id));
    }
  }
}
