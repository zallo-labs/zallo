import { Injectable, Logger } from '@nestjs/common';
import { Address, Erc20__factory, asAddress, asBigInt, toArray, tryOrIgnore } from 'lib';
import {
  TransactionEventData,
  TransactionsProcessor,
} from '../transactions/transactions.processor';
import { EventData, EventsProcessor } from '../events/events.processor';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { TransferDirection } from './transfers.model';
import { ProviderService } from '../util/provider/provider.service';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import { L2_ETH_TOKEN_ADDRESS } from 'zksync-web3/build/src/utils';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { PubsubService } from '../util/pubsub/pubsub.service';

const ERC20 = Erc20__factory.createInterface();
const altEthAddress = asAddress(L2_ETH_TOKEN_ADDRESS);

export const TRANSFER_SUBSCRIPTION = 'transfer';
export const ACCOUNT_TRANSFER_SUBSCRIPTION = `${TRANSFER_SUBSCRIPTION}.account`;
export interface TransferSubscriptionPayload {
  [TRANSFER_SUBSCRIPTION]: uuid;
  account: Address;
  direction: TransferDirection;
}

@Injectable()
export class TransfersEvents {
  constructor(
    private db: DatabaseService,
    private eventsProcessor: EventsProcessor,
    private transactionsProcessor: TransactionsProcessor,
    private provider: ProviderService,
    private pubsub: PubsubService,
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

  private async transfer({ log }: EventData | TransactionEventData, isTransactionEvent: boolean) {
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
      Logger.debug(`Transfer ${from} -> ${to}`);
      const block = await this.provider.getBlock(log.blockNumber);

      let token = asAddress(log.address);
      if (token === altEthAddress) token = ETH_ADDRESS as Address; // Normalize ETH address

      const transfers: { id: uuid } | { id: uuid }[] = await this.db.query(
        e.set(
          ...accounts.map((a) =>
            e.insert(e.Transfer, {
              account: selectAccount(a),
              direction: e.cast(
                e.TransferDirection,
                a === from ? TransferDirection.Out : TransferDirection.In,
              ),
              from,
              to,
              token,
              amount,
              block: BigInt(log.blockNumber),
              timestamp: new Date(block.timestamp * 1000),
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

      await Promise.all(
        toArray(transfers).map(async (transfer, index) => {
          const account = accounts[index] as Address;

          await this.pubsub.publish<TransferSubscriptionPayload>(
            `${ACCOUNT_TRANSFER_SUBSCRIPTION}.${account}`,
            {
              transfer: transfer.id,
              account,
              direction: account === from ? TransferDirection.Out : TransferDirection.In,
            },
          );
        }),
      );
    }
  }
}
