import { Injectable, Logger } from '@nestjs/common';
import { Address, UAddress, asAddress, asUAddress, isTruthy, ETH_ADDRESS, isEthToken } from 'lib';
import { ERC20 } from 'lib/dapps';
import { TransactionEventData, TransactionsWorker } from '../transactions/transactions.worker';
import { EventData, EventsWorker } from '../events/events.worker';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { NetworksService } from '../util/networks/networks.service';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { PubsubService } from '../util/pubsub/pubsub.service';
import { getAbiItem } from 'viem';
import { and } from '../database/database.util';
import { TransferDirection } from './transfers.input';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { ExpoService } from '../util/expo/expo.service';
import { CONFIG } from '~/config';
import { BalancesService } from '~/features/util/balances/balances.service';
import Decimal from 'decimal.js';
import { TokensService } from '~/features/tokens/tokens.service';
import { ampli } from '~/util/ampli';

export const getTransferTrigger = (account: UAddress) => `transfer.account.${account}`;
export interface TransferSubscriptionPayload {
  transfer: uuid;
  directions: TransferDirection[];
  internal: boolean;
}

const transferEvent = getAbiItem({ abi: ERC20, name: 'Transfer' });
const approvalEvent = getAbiItem({ abi: ERC20, name: 'Approval' });

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
    this.eventsProcessor.on(transferEvent, (data) => this.transfer(data));
    this.transactionsProcessor.onEvent(transferEvent, (data) => this.transfer(data));

    this.eventsProcessor.on(approvalEvent, (data) => this.approval(data));
    this.transactionsProcessor.onEvent(approvalEvent, (data) => this.approval(data));
  }

  private async transfer(
    event: EventData<typeof transferEvent> | TransactionEventData<typeof transferEvent>,
  ) {
    const { chain, log } = event;
    const { args } = log;
    const isFromTransaction = 'receipt' in event;

    const [from, to] = [asUAddress(args.from, chain), asUAddress(args.to, chain)];
    const isAccount = await this.accountsCache.isAccount([from, to]);
    const accounts = [isAccount[0] && from, isAccount[1] && to].filter(isTruthy);
    if (!accounts.length) return;

    const token = asUAddress(normalizeEthAddress(asAddress(log.address)), chain);
    const network = this.networks.get(chain);
    const block =
      'block' in event ? event.block : await network.getBlock({ blockNumber: log.blockNumber });
    const amount = await this.tokens.asDecimal(token, args.value);
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

  private async approval(
    event: EventData<typeof approvalEvent> | TransactionEventData<typeof approvalEvent>,
  ) {
    const { chain, log } = event;
    const { args } = log;

    const from = asUAddress(args.owner, chain);
    const to = asUAddress(args.spender, chain);

    const isAccount = await this.accountsCache.isAccount([from, to]);
    const accounts = [isAccount[0] && from, isAccount[1] && to].filter(isTruthy);
    if (!accounts.length) return;

    const token = asUAddress(normalizeEthAddress(asAddress(log.address)), chain);
    const network = this.networks.get(chain);
    const block =
      'block' in event ? event.block : await network.getBlock({ blockNumber: log.blockNumber });
    const amount = await this.tokens.asDecimal(token, args.value);
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
