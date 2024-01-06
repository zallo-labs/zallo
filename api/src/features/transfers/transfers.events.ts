import { Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { decodeEventLog, getAbiItem } from 'viem';

import {
  Address,
  asAddress,
  asUAddress,
  ETH_ADDRESS,
  Hex,
  isEthToken,
  isTruthy,
  tryOrIgnore,
  UAddress,
} from 'lib';
import { ERC20 } from 'lib/dapps';
import { CONFIG } from '~/config';
import e from '~/edgeql-js';
import { TokensService } from '~/features/tokens/tokens.service';
import { BalancesService } from '~/features/util/balances/balances.service';
import { ampli } from '~/util/ampli';
import { selectAccount } from '../accounts/accounts.util';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { DatabaseService } from '../database/database.service';
import { and } from '../database/database.util';
import { EventData, EventsWorker } from '../events/events.worker';
import { TransactionEventData, TransactionsWorker } from '../transactions/transactions.worker';
import { ExpoService } from '../util/expo/expo.service';
import { NetworksService } from '../util/networks/networks.service';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { TransferDirection } from './transfers.input';

export const getTransferTrigger = (account: UAddress) => `transfer.account.${account}`;
export interface TransferSubscriptionPayload {
  transfer: uuid;
  directions: TransferDirection[];
  internal: boolean;
}

@Injectable()
export class TransfersEvents {
  private log = new Logger(this.constructor.name);

  constructor(
    private db: DatabaseService,
    private eventsProcessor: EventsWorker,
    private transactionsProcessor: TransactionsWorker,
    private networks: NetworksService,
    private pubsub: PubsubService,
    private accountsCache: AccountsCacheService,
    private expo: ExpoService,
    private balances: BalancesService,
    private tokens: TokensService,
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

    const [from, to] = [asUAddress(r.args.from, chain), asUAddress(r.args.to, chain)];
    const isAccount = await this.accountsCache.isAccount([from, to]);
    const accounts = [isAccount[0] && from, isAccount[1] && to].filter(isTruthy);
    if (!accounts.length) return;

    const token = asUAddress(normalizeEthAddress(asAddress(log.address)), chain);
    const network = this.networks.get(chain);
    const block =
      'block' in event ? event.block : await network.getBlock({ blockNumber: log.blockNumber });
    const amount = await this.tokens.asDecimal(token, r.args.value);
    const [localFrom, localTo] = [asAddress(from), asAddress(to)];

    await Promise.all(
      accounts.map(async (account) => {
        const selectedAccount = selectAccount(account);
        const transaction = e.assert_single(
          e.select(e.Transaction, (t) => ({
            filter: and(
              e.op(t.hash, '=', log.transactionHash),
              e.op(t.proposal.account, '=', selectedAccount),
            ),
          })),
        );

        const transfer = await this.db.query(
          e.select(
            e
              .insert(e.Transfer, {
                account: selectedAccount,
                transactionHash: log.transactionHash,
                transaction,
                logIndex: log.logIndex,
                block: log.blockNumber,
                timestamp: new Date(Number(block.timestamp) * 1000),
                from: localFrom,
                to: localTo,
                tokenAddress: token,
                amount:
                  from === to
                    ? '0'
                    : to === account
                      ? amount.toString()
                      : amount.negated().toString(),
                direction: [account === to && 'In', account === from && 'Out'].filter(Boolean) as [
                  'In',
                ],
                isFeeTransfer: e.op(
                  e.op(transaction.proposal.paymaster, 'in', e.set(localFrom, localTo)),
                  '??',
                  false,
                ),
              })
              .unlessConflict((t) => ({
                on: e.tuple([t.account, t.block, t.logIndex]),
                else: t,
              })),
            () => ({
              id: true,
              internal: true,
              isFeeTransfer: true,
              account: { approvers: { user: true } },
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

        if (!isFromTransaction && !transfer.isFeeTransfer) {
          this.log.debug(
            `[${account}]: token (${token}) transfer ${
              from === account ? `to ${to}` : `from ${from}`
            }`,
          );

          if (to === account) this.notifyMembers('transfer', account, from, token, amount);
        }

        transfer.account.approvers.map(({ user }) => {
          ampli.transfer(user.id, { in: to === account, out: from === account });
        });
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

    const isAccount = await this.accountsCache.isAccount([from, to]);
    const accounts = [isAccount[0] && from, isAccount[1] && to].filter(isTruthy);
    if (!accounts.length) return;

    const token = asUAddress(normalizeEthAddress(asAddress(log.address)), chain);
    const network = this.networks.get(chain);
    const block =
      'block' in event ? event.block : await network.getBlock({ blockNumber: log.blockNumber });
    const amount = await this.tokens.asDecimal(token, r.args.value);
    const [localFrom, localTo] = [asAddress(from), asAddress(to)];

    await Promise.all(
      accounts.map(async (account) => {
        const selectedAccount = selectAccount(account);
        const transaction = e.assert_single(
          e.select(e.Transaction, (t) => ({
            filter: and(
              e.op(t.hash, '=', log.transactionHash),
              e.op(t.proposal.account, '=', selectedAccount),
            ),
          })),
        );

        await this.db.query(
          e
            .insert(e.TransferApproval, {
              account: selectedAccount,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex,
              block: log.blockNumber,
              timestamp: new Date(Number(block.timestamp) * 1000),
              from: localFrom,
              to: localTo,
              tokenAddress: token,
              amount:
                from === to
                  ? '0'
                  : to === account
                    ? amount.toString()
                    : amount.negated().toString(),
              direction: [account === to && 'In', account === from && 'Out'].filter(Boolean) as [
                'In',
              ],
              isFeeTransfer: e.op(
                e.op(transaction.proposal.paymaster, 'in', e.set(localFrom, localTo)),
                '??',
                false,
              ),
            })
            .unlessConflict(),
        );

        if (to === account) {
          this.log.debug(`Transfer approval ${token}: ${from} -> ${to}`);
          this.notifyMembers('approval', account, from, token, amount);
        }
      }),
    );
  }

  private async notifyMembers(
    type: 'transfer' | 'approval',
    account: UAddress,
    from: UAddress,
    token: UAddress,
    amount: Decimal,
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
                ? `${amount} ${t.symbol} received from ${fromLabel}`
                : `Tokens (${truncateAddress(token)}) received from ${fromLabel}`
              : t
                ? `${fromLabel} has allowed you to spend ${amount} ${t.symbol} `
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
