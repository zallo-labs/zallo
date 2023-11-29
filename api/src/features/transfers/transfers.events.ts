import { Injectable, Logger } from '@nestjs/common';
import {
  Address,
  Hex,
  UAddress,
  asAddress,
  asUAddress,
  isTruthy,
  tryOrIgnore,
  ETH_ADDRESS,
  isEthToken,
} from 'lib';
import { ERC20 } from 'lib/dapps';
import {
  TransactionEventData,
  TransactionsProcessor,
} from '../transactions/transactions.processor';
import { EventData, EventsProcessor } from '../events/events.processor';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { NetworksService } from '../util/networks/networks.service';
import { utils as zkUtils } from 'zksync2-js';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { decodeEventLog, formatUnits, getAbiItem } from 'viem';
import { and } from '../database/database.util';
import { TransferDirection } from './transfers.input';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { ExpoService } from '../util/expo/expo.service';
import { CONFIG } from '~/config';
import { BalancesService } from '~/features/util/balances/balances.service';

export const getTransferTrigger = (account: UAddress) => `transfer.account.${account}`;
export interface TransferSubscriptionPayload {
  transfer: uuid;
  directions: TransferDirection[];
  internal: boolean;
}

@Injectable()
export class TransfersEvents {
  constructor(
    private db: DatabaseService,
    private eventsProcessor: EventsProcessor,
    private transactionsProcessor: TransactionsProcessor,
    private networks: NetworksService,
    private pubsub: PubsubService,
    private accountsCache: AccountsCacheService,
    private expo: ExpoService,
    private balances: BalancesService,
  ) {
    /*
     * Events processor handles events `to` account
     * Transactions processor handles events `from` account - in order to be associated with the transaction
     */
    const transferEvent = getAbiItem({ abi: ERC20, name: 'Transfer' });
    this.eventsProcessor.on(transferEvent, (data) => this.transfer(data));
    this.transactionsProcessor.onEvent(transferEvent, (data) => this.transfer(data));

    const approvalEvent = getAbiItem({ abi: ERC20, name: 'Approval' });
    this.eventsProcessor.on(approvalEvent, (data) => this.approval(data));
    this.transactionsProcessor.onEvent(approvalEvent, (data) => this.approval(data));
  }

  private async transfer(event: EventData | TransactionEventData) {
    const { chain, log } = event;
    const isFromTransaction = 'receipt' in event;

    const r = tryOrIgnore(() =>
      decodeEventLog({
        abi: ERC20,
        eventName: 'Transfer',
        data: log.data as Hex,
        topics: log.topics as [Hex, ...Hex[]],
      }),
    );
    if (!r) return;

    const from = asUAddress(r.args.from, chain);
    const to = asUAddress(r.args.to, chain);
    const amount = r.args.value;

    const isAccount = await this.accountsCache.isAccount([from, to]);
    const accounts = [isAccount[0] && from, isAccount[1] && to].filter(isTruthy);
    if (!accounts.length) return;

    const token = asUAddress(normalizeEthAddress(asAddress(log.address)), chain);
    const network = this.networks.get(chain);
    const block =
      'block' in event ? event.block : await network.getBlock({ blockNumber: log.blockNumber });

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
                block: log.blockNumber,
                timestamp: new Date(Number(block.timestamp) * 1000),
                from: asAddress(from),
                to: asAddress(to),
                tokenAddress: token,
                amount: from === to ? 0n : to === account ? amount : -amount,
                direction: [account === to && 'In', account === from && 'Out'].filter(Boolean) as [
                  'In',
                ],
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

        this.balances.invalidateBalance({ account, token: asAddress(token) });

        this.pubsub.publish<TransferSubscriptionPayload>(getTransferTrigger(account), {
          transfer: transfer.id,
          directions: [
            from === account && TransferDirection.Out,
            to === account && TransferDirection.In,
          ].filter(isTruthy),
          internal: transfer.internal,
        });

        if (!isFromTransaction && asAddress(from) !== zkUtils.BOOTLOADER_FORMAL_ADDRESS) {
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
    const { chain, log } = event;

    const r = tryOrIgnore(() =>
      decodeEventLog({
        abi: ERC20,
        eventName: 'Approval',
        data: log.data as Hex,
        topics: log.topics as [Hex, ...Hex[]],
      }),
    );
    if (!r) return;

    const from = asUAddress(r.args.owner, chain);
    const to = asUAddress(r.args.spender, chain);
    const amount = r.args.value;

    const isAccount = await this.accountsCache.isAccount([from, to]);
    const accounts = [isAccount[0] && from, isAccount[1] && to].filter(isTruthy);
    if (!accounts.length) return;

    const tokenAddress = asUAddress(normalizeEthAddress(asAddress(log.address)), chain);
    const block = await this.networks.get(chain).getBlock({ blockNumber: log.blockNumber });
    Logger.debug(`Transfer approval ${tokenAddress}: ${from} -> ${to}`);

    await Promise.all(
      accounts.map(async (account) => {
        await this.db.query(
          e
            .insert(e.TransferApproval, {
              account: selectAccount(account),
              transactionHash: log.transactionHash,
              logIndex: log.logIndex,
              block: log.blockNumber,
              timestamp: new Date(Number(block.timestamp) * 1000),
              from: asAddress(from),
              to: asAddress(to),
              tokenAddress,
              amount: from === to ? 0n : to === account ? amount : -amount,
              direction: [account === to && 'In', account === from && 'Out'].filter(Boolean) as [
                'In',
              ],
            })
            .unlessConflict(),
        );

        if (to === account) this.notifyMembers('approval', account, from, tokenAddress, amount);
      }),
    );
  }

  private async notifyMembers(
    type: 'transfer' | 'approval',
    account: UAddress,
    from: UAddress,
    token: UAddress,
    amount: bigint,
  ) {
    const { acc, tokenMetadata } = await this.db.query(
      e.select({
        acc: e.select(e.Account, (a) => ({
          filter_single: { address: account },
          label: true,
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

    const accountName = acc.label + CONFIG.ensSuffix;

    await this.expo.sendNotification(
      acc.approvers.map((a) => {
        const fromLabel = a.fromContactLabel || truncateAddress(from);
        const t = a.token ?? tokenMetadata;

        return {
          to: a.pushToken!,
          title:
            type === 'transfer'
              ? `${accountName}: tokens received`
              : `${accountName}: spending approval`,
          body:
            type === 'transfer'
              ? t
                ? `${formatUnits(amount, t.decimals)} ${t.symbol} received from ${fromLabel}`
                : `Tokens (${truncateAddress(token)}) received from ${fromLabel}`
              : t
              ? `${fromLabel} has allowed you to spend ${formatUnits(
                  amount,
                  t.decimals,
                )} of their ${t.symbol} `
              : `${fromLabel} has allowed you to spend their tokens (${truncateAddress(token)})`,
          channelId: 'transfers',
          priority: 'normal',
        };
      }),
    );
  }
}

function truncateAddress(address: UAddress) {
  const local = asAddress(address);
  return `${local.slice(0, 5)}...${local.length - 3}`;
}

function normalizeEthAddress(address: Address) {
  return isEthToken(address) ? ETH_ADDRESS : address;
}
