import { Injectable } from '@nestjs/common';
import { Erc20__factory, asAddress, asBigInt, tryOrIgnore } from 'lib';
import {
  TransactionEventData,
  TransactionsProcessor,
} from '../transactions/transactions.processor';
import { ListenerData, EventsProcessor } from '../events/events.processor';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.service';
import { TransferDirection } from './transfers.model';

const ERC20 = Erc20__factory.createInterface();

@Injectable()
export class TransfersEvents {
  constructor(
    private db: DatabaseService,
    private eventsProcessor: EventsProcessor,
    private transactionsProcessor: TransactionsProcessor,
  ) {
    this.eventsProcessor.on(
      ERC20.getEventTopic(ERC20.events['Transfer(address,address,uint256)']),
      (data) => this.transfer(data, false),
    );
    this.transactionsProcessor.onEvent(
      ERC20.getEventTopic(ERC20.events['Transfer(address,address,uint256)']),
      (data) => this.transfer(data, true),
    );
  }

  private async transfer(
    { log }: ListenerData | TransactionEventData,
    isTransactionEvent: boolean,
  ) {
    const r = tryOrIgnore(() =>
      ERC20.decodeEventLog(ERC20.events['Transfer(address,address,uint256)'], log.data, log.topics),
    );
    if (!r) return;
    const [from, to, amount] = [asAddress(r.from), asAddress(r.to), asBigInt(r.value)];

    const accounts = await this.db.query(
      e.select(e.Account, (a) => ({
        // Only process account transfers; waiting for transaction events when originating from an account
        filter: e.op(a.address, 'in', isTransactionEvent ? e.set(from, to) : e.set(to)),
        address: true,
      })).address,
    );

    if (accounts.length) {
      await this.db.query(
        e.set(
          ...accounts.map((a) =>
            e.insert(e.Transfer, {
              account: selectAccount(a),
              direction: a === from ? TransferDirection.Out : TransferDirection.In,
              from,
              to,
              token: asAddress(log.address),
              amount,
              block: BigInt(log.blockNumber),
              ...(isTransactionEvent && {
                receipt: e.select(e.Transaction, () => ({
                  filter_single: { hash: log.transactionHash },
                  receipt: { id: true },
                })).receipt,
              }),
            }),
          ),
        ),
      );
    }
  }
}
