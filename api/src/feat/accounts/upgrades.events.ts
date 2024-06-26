import { Injectable, Logger } from '@nestjs/common';
import { asUAddress, ACCOUNT_PROXY, asDecimal } from 'lib';
import { TransactionEventData, ReceiptsWorker } from '../system-txs/receipts.worker';
import { DatabaseService } from '~/core/database';
import { selectAccount } from './accounts.util';
import { getAbiItem } from 'viem';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { ampli } from '~/util/ampli';
import { AccountsService } from '~/feat/accounts/accounts.service';
import { AccountEvent } from '~/feat/accounts/accounts.input';
import e from '~/edgeql-js';
import { ETH } from 'lib/dapps';

const upgradedEvent = getAbiItem({ abi: ACCOUNT_PROXY.abi, name: 'Upgraded' });

@Injectable()
export class UpgradeEvents {
  private log = new Logger(this.constructor.name);

  constructor(
    private db: DatabaseService,
    private receipts: ReceiptsWorker,
    private accounts: AccountsService,
    private accountsCache: AccountsCacheService,
  ) {
    this.receipts.onEvent(upgradedEvent, (data) => this.upgraded(data));
  }

  private async upgraded(event: TransactionEventData<typeof upgradedEvent>) {
    const { implementation } = event.log.args;

    const address = asUAddress(event.log.address, event.chain);
    if (!(await this.accountsCache.isAccount(address))) return;

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
          e.decimal(
            asDecimal(event.receipt.gasUsed * event.receipt.effectiveGasPrice, ETH).toString(),
          ),
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
    await this.accounts.event({ account: address, event: AccountEvent.update });
    if (activated) {
      users.forEach((user) => ampli.accountActivated(user.id));
    }
  }
}
