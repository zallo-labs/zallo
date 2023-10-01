import { Injectable, Logger } from '@nestjs/common';
import { Address, ERC20_ABI, Hex, asAddress, isTruthy, tryOrIgnore } from 'lib';
import {
  TransactionEventData,
  TransactionsProcessor,
} from '../transactions/transactions.processor';
import { EventData, EventsProcessor } from '../events/events.processor';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { ProviderService } from '../util/provider/provider.service';
import { BOOTLOADER_FORMAL_ADDRESS, ETH_ADDRESS } from 'zksync-web3/build/src/utils';
import { L2_ETH_TOKEN_ADDRESS } from 'zksync-web3/build/src/utils';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { decodeEventLog, formatUnits, getAbiItem, getEventSelector } from 'viem';
import { and } from '../database/database.util';
import { TransferDirection } from './transfers.input';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { ExpoService } from '../util/expo/expo.service';

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
    private expo: ExpoService,
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
    const isFromTransaction = 'receipt' in event;

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

        this.provider.invalidateBalance({ account, token });

        this.pubsub.publish<TransferSubscriptionPayload>(getTransferTrigger(account), {
          transfer: transfer.id,
          account,
          directions: [
            from === account && TransferDirection.Out,
            to === account && TransferDirection.In,
          ].filter(isTruthy),
          internal: transfer.internal,
        });

        if (!isFromTransaction && from !== BOOTLOADER_FORMAL_ADDRESS) {
          Logger.debug(
            `[${account}]: token (${token}) transfer ${
              from === account ? `to ${to}` : `from ${from}`
            }`,
          );

          if (to === account) this.notifyMembers('transfer', account, from, token, amount);
        }
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

    const isAccount = await this.accountsCache.isAccount([from, to]);
    const accounts = [isAccount[0] && from, isAccount[1] && to].filter(isTruthy);
    if (!accounts.length) return;

    Logger.debug(`Transfer approval ${from} -> ${to}`);
    const block = await this.provider.getBlock(log.blockNumber);
    const tokenAddress = normalizeEthAddress(asAddress(log.address));

    await Promise.all(
      accounts.map(async (account) => {
        await this.db.query(
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
        );

        if (to === account) this.notifyMembers('approval', account, from, tokenAddress, amount);
      }),
    );
  }

  private async notifyMembers(
    type: 'transfer' | 'approval',
    account: Address,
    from: Address,
    token: Address,
    amount: bigint,
  ) {
    const { acc, tokenMetadata } = await this.db.query(
      e.select({
        acc: e.select(e.Account, (a) => ({
          filter_single: { address: account },
          name: true,
          approvers: e.select(a.approvers, (approver) => ({
            filter: e.op('exists', approver.pushToken),
            pushToken: approver.pushToken,
            fromContactLabel: e.assert_single(
              e.select(approver.user.contacts, (c) => ({
                filter: e.op(c.address, '=', from),
                label: true,
              })).label,
            ),
            token: e.select(e.Token, () => ({
              filter_single: { address: token, user: approver.user },
              symbol: true,
              decimals: true,
            })),
          })),
        })),
        tokenMetadata: e.assert_single(
          e.select(e.Token, (t) => ({
            filter: e.op(e.op(t.address, '=', token), 'and', e.op('not', e.op('exists', t.user))),
            limit: 1,
            symbol: true,
            decimals: true,
          })),
        ),
      }),
    );

    if (!acc) return;

    const truncatedTokenLabel = `${token.slice(0, 5)}...${token.length - 3}`;
    const truncatedFromLabel = `${from.slice(0, 5)}...${from.length - 3}`;

    await this.expo.sendNotification(
      acc.approvers.map((a) => {
        const fromLabel = a.fromContactLabel || truncatedFromLabel;
        const t = a.token ?? tokenMetadata;

        return {
          to: a.pushToken!,
          title:
            type === 'transfer' ? `${acc.name}: tokens received` : `${acc.name}: spending approval`,
          body:
            type === 'transfer'
              ? t
                ? `${formatUnits(amount, t.decimals)} ${t.symbol} received from ${fromLabel}`
                : `Tokens (${truncatedTokenLabel}) received from ${fromLabel}`
              : t
              ? `${fromLabel} has allowed you to spend ${formatUnits(
                  amount,
                  t.decimals,
                )} of their ${t.symbol} `
              : `${fromLabel} has allowed you to spend their tokens (${truncatedTokenLabel})`,
          channelId: 'transfers',
          priority: 'normal',
        };
      }),
    );
  }
}
