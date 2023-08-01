import { Injectable, Logger } from '@nestjs/common';
import { Address, ERC20_ABI, Hex, asAddress, isPresent, toArray, tryOrIgnore } from 'lib';
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
import { decodeEventLog, getAbiItem, getEventSelector } from 'viem';

const altEthAddress = asAddress(L2_ETH_TOKEN_ADDRESS);
const normalizeEthAddress = (address: Address) =>
  address === altEthAddress ? ETH_ADDRESS : address;

export const getTransferTrigger = (account: Address) => `transfer.account.${account}`;
export interface TransferSubscriptionPayload {
  transfer: uuid;
  account: Address;
  direction: TransferDirection;
  internal: boolean;
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
    /*
     * Events processor handles events `to` account
     * Transactions processor handles events `from` account - in order to be associated with the transaction
     */
    const transferSelector = getEventSelector(getAbiItem({ abi: ERC20_ABI, name: 'Transfer' }));
    this.eventsProcessor.on(transferSelector, (data) => this.transfer(data));
    this.transactionsProcessor.onEvent(transferSelector, (data) => this.transfer(data));

    const approvalSelector = getEventSelector(getAbiItem({ abi: ERC20_ABI, name: 'Approval' }));
    this.eventsProcessor.on(approvalSelector, (data) => this.approval(data));
    this.transactionsProcessor.onEvent(approvalSelector, (data) => this.approval(data));
  }

  private async transfer(event: EventData | TransactionEventData) {
    const { log } = event;

    const r = tryOrIgnore(() =>
      decodeEventLog({
        abi: ERC20_ABI,
        eventName: 'Transfer',
        data: log.data as Hex,
        topics: log.topics as [Hex, ...Hex[]],
      }),
    );
    if (!r) return;

    const { from, to, value: amount } = r.args;

    const accounts = (await this.db.query(
      e.select(e.Account, (account) => ({
        filter: e.op(account.address, 'in', e.set(from, to)),
        address: true,
      })).address,
    )) as Address[];

    if (!accounts.length) return;

    const token = normalizeEthAddress(asAddress(log.address));
    const { timestamp } = await this.provider.getBlock(log.blockNumber);
    const block = BigInt(log.blockNumber);

    await Promise.all(
      accounts.map(async (account) => {
        const direction = account === from ? TransferDirection.Out : TransferDirection.In;

        const r = await this.db.query(
          e.select({
            newTransfer: e.select(
              e
                .insert(e.Transfer, {
                  account: selectAccount(account),
                  transactionHash: log.transactionHash,
                  logIndex: log.logIndex,
                  block,
                  timestamp: new Date(timestamp * 1000),
                  direction: e.cast(e.TransferDirection, direction),
                  from,
                  to,
                  tokenAddress: token,
                  amount: direction === TransferDirection.In ? amount : -amount,
                })
                .unlessConflict(),
              (t) => ({
                id: true,
                internal: e.op('exists', t.transaction),
              }),
            ),
            existingTransfer: e.select(e.Transfer, (t) => ({
              filter_single: { account: selectAccount(account), block, logIndex: log.logIndex },
              id: true,
              internal: e.op('exists', t.transaction),
            })),
          }),
        );

        if (r.newTransfer) {
          Logger.debug(
            `[${account}]: token (${token}) transfer ${
              from === account ? `to ${to}` : `from ${from}`
            }`,
          );

          this.provider.invalidateBalance({ account, token });
        }

        const transfer = (r.newTransfer ?? r.existingTransfer)!;
        await this.pubsub.publish<TransferSubscriptionPayload>(getTransferTrigger(account), {
          transfer: transfer.id,
          account,
          direction,
          internal: transfer.internal,
        });
      }),
    );
  }

  private async approval(event: EventData | TransactionEventData) {
    const { log } = event;

    const r = tryOrIgnore(() =>
      decodeEventLog({
        abi: ERC20_ABI,
        eventName: 'Approval',
        data: log.data as Hex,
        topics: log.topics as [Hex, ...Hex[]],
      }),
    );
    if (!r) return;

    const { owner: from, spender: to, value: amount } = r.args;

    const accounts = await this.db.query(
      e.select(e.Account, (account) => ({
        filter: e.op(account.address, 'in', e.set(from, to)),
        address: true,
      })).address,
    );

    if (accounts.length) {
      Logger.debug(`Transfer approval ${from} -> ${to}`);
      const block = await this.provider.getBlock(log.blockNumber);
      const tokenAddress = normalizeEthAddress(asAddress(log.address));

      const approvals = toArray(
        await this.db.query(
          e.set(
            ...accounts.map((a) =>
              e
                .insert(e.TransferApproval, {
                  account: selectAccount(a),
                  transactionHash: log.transactionHash,
                  logIndex: log.logIndex,
                  block: BigInt(log.blockNumber),
                  timestamp: new Date(block.timestamp * 1000),
                  direction: e.cast(
                    e.TransferDirection,
                    a === from ? TransferDirection.Out : TransferDirection.In,
                  ),
                  from,
                  to,
                  tokenAddress,
                  amount,
                })
                .unlessConflict(),
            ),
          ),
        ),
      ).filter(isPresent);
    }
  }
}
