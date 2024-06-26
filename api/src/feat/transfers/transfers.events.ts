import { Injectable, Logger } from '@nestjs/common';
import { Address, UAddress, asAddress, asUAddress, isTruthy, ETH_ADDRESS, isEthToken } from 'lib';
import { ERC20 } from 'lib/dapps';
import { TransactionEventData, ReceiptsWorker } from '../system-txs/receipts.worker';
import { EventData, EventsWorker } from '../events/events.worker';
import { DatabaseService } from '~/core/database';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { NetworksService } from '~/core/networks/networks.service';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { EventPayload, PubsubService } from '~/core/pubsub/pubsub.service';
import { getAbiItem } from 'viem';
import { TransferDirection } from './transfers.input';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { ExpoService } from '~/core/expo/expo.service';
import { BalancesService } from '~/core/balances/balances.service';
import Decimal from 'decimal.js';
import { TokensService } from '~/feat/tokens/tokens.service';
import { ampli } from '~/util/ampli';
import { selectSysTx } from '../system-txs/system-tx.util';
import { and } from '~/core/database';

export const transferTrigger = (account: UAddress) => `transfer.account.${account}`;
export interface TransferSubscriptionPayload extends EventPayload<'transfer'> {
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
    private events: EventsWorker,
    private receipts: ReceiptsWorker,
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
    this.events.on(transferEvent, (data) => this.transfer(data));
    this.receipts.onEvent(transferEvent, (data) => this.transfer(data));

    this.events.on(approvalEvent, (data) => this.approval(data));
    this.receipts.onEvent(approvalEvent, (data) => this.approval(data));
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
        const systx = e.assert_single(
          e.select(e.SystemTx, (systx) => ({
            filter: and(
              e.op(systx.hash, '=', log.transactionHash),
              e.op(systx.proposal.account, '?=', selectedAccount),
            ),
          })),
        );

        const transfer = await this.db.query(
          e.select(
            e
              .insert(e.Transfer, {
                account: selectedAccount,
                systxHash: log.transactionHash,
                systx,
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
                  e.op(systx.proposal.paymaster, 'in', e.set(localFrom, localTo)),
                  '??',
                  false,
                ),
              })
              .unlessConflict((t) => ({
                on: e.tuple([t.account, t.block, t.logIndex]),
              })),
            (t) => ({
              id: true,
              internal: true,
              isFeeTransfer: true,
              accountUsers: t.account.approvers.user.id,
            }),
          ),
        );
        if (!transfer) return; // Already processed

        this.balances.invalidate({ account, token });

        this.pubsub.event<TransferSubscriptionPayload>(transferTrigger(account), {
          event: 'transfer',
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

        transfer.accountUsers.map((user) => {
          ampli.transfer(user, { in: to === account, out: from === account });
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
        const systx = selectSysTx(log.transactionHash);

        const approval = await this.db.query(
          e
            .insert(e.TransferApproval, {
              account: selectedAccount,
              systxHash: log.transactionHash,
              systx,
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
                e.op(systx.proposal.paymaster, 'in', e.set(localFrom, localTo)),
                '??',
                false,
              ),
            })
            .unlessConflict((t) => ({
              on: e.tuple([t.account, t.block, t.logIndex]),
            })),
        );
        if (!approval) return; // Already processed

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
    const acc = await this.db.query(
      e.select(e.Account, (a) => ({
        filter_single: { address: account },
        name: true,
        approvers: e.select(a.approvers, (approver) => ({
          filter: e.op('exists', approver.pushToken),
          pushToken: approver.pushToken,
          fromLabel: e.labelForUser(from, approver.user),
          token: e.select(e.tokenForUser(token, approver.user), () => ({
            symbol: true,
            decimals: true,
          })),
        })),
      })),
    );
    if (!acc) return;

    await this.expo.sendNotification(
      acc.approvers.map((a) => {
        const fromLabel = a.fromLabel || truncateAddress(from);
        const t = a.token;

        return {
          to: a.pushToken!,
          title:
            type === 'transfer' ? `${acc.name}: tokens received` : `${acc.name}: spending approval`,
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
