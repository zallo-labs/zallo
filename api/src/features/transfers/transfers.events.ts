import { Injectable, Logger } from '@nestjs/common';
import { Address, ERC20_ABI, Hex, asAddress, isPresent, isTruthy, toArray, tryOrIgnore } from 'lib';
import {
  TransactionEventData,
  TransactionsProcessor,
} from '../transactions/transactions.processor';
import { EventData, EventsProcessor } from '../events/events.processor';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { ProviderService } from '../util/provider/provider.service';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import { L2_ETH_TOKEN_ADDRESS } from 'zksync-web3/build/src/utils';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { decodeEventLog, getAbiItem, getEventSelector } from 'viem';
import { and } from '../database/database.util';
import { TransferDirection } from './transfers.input';
import { AccountsCacheService } from '../auth/accounts.cache.service';

const altEthAddress = asAddress(L2_ETH_TOKEN_ADDRESS);
const normalizeEthAddress = (address: Address) =>
  address === altEthAddress ? ETH_ADDRESS : address;

export const getTransferTrigger = (account: Address) => `transfer.account.${account}`;
export interface TransferSubscriptionPayload {
  transfer: uuid;
  account: Address;
  directions: TransferDirection[];
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
    private accountsCache: AccountsCacheService,
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

    const isAccount = await this.accountsCache.isAccount([from, to]);
    const accounts = [isAccount[0] && from, isAccount[1] && to].filter(isTruthy);

    if (!accounts.length) return;

    const token = normalizeEthAddress(asAddress(log.address));
    const { timestamp } = await this.provider.getBlock(log.blockNumber);
    const block = BigInt(log.blockNumber);

    await Promise.all(
      accounts.map(async (account) => {
        const selectedAccount = selectAccount(account);

        const transfer = await this.db.query(
          e.select(
            e
              .insert(e.Transfer, {
                account: selectedAccount,
                transactionHash: log.transactionHash,
                transaction: e.assert_single(
                  e.select(e.Transaction, (t) => ({
                    filter: and(
                      e.op(t.hash, '=', log.transactionHash),
                      e.op(t.proposal.account, '=', selectedAccount),
                    ),
                  })),
                ),
                logIndex: log.logIndex,
                block,
                timestamp: new Date(timestamp * 1000),
                from,
                to,
                tokenAddress: token,
                amount: from === to ? 0n : to === account ? amount : -amount,
              })
              .unlessConflict((t) => ({
                on: e.tuple([t.account, t.block, t.logIndex]),
                else: t,
              })),
            () => ({
              id: true,
              internal: true,
            }),
          ),
        );

        Logger.debug(
          `[${account}]: token (${token}) transfer ${
            from === account ? `to ${to}` : `from ${from}`
          }`,
        );

        this.provider.invalidateBalance({ account, token });

        await this.pubsub.publish<TransferSubscriptionPayload>(getTransferTrigger(account), {
          transfer: transfer.id,
          account,
          directions: [
            from === account && TransferDirection.Out,
            to === account && TransferDirection.In,
          ].filter(isTruthy),
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
            ...accounts.map((account) =>
              e
                .insert(e.TransferApproval, {
                  account: selectAccount(account),
                  transactionHash: log.transactionHash,
                  logIndex: log.logIndex,
                  block: BigInt(log.blockNumber),
                  timestamp: new Date(block.timestamp * 1000),
                  from,
                  to,
                  tokenAddress,
                  amount: from === to ? 0n : to === account ? amount : -amount,
                })
                .unlessConflict(),
            ),
          ),
        ),
      ).filter(isPresent);
    }
  }
}
