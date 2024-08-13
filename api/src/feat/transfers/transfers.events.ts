import { Injectable, Logger } from '@nestjs/common';
import { Address, UAddress, asAddress, asUAddress, isTruthy, ETH_ADDRESS, isEthToken } from 'lib';
import { ERC20 } from 'lib/dapps';
import { EventsService, OptimisticEvent, ConfirmedEvent } from '../events/events.service';
import { and, DatabaseService } from '~/core/database';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { NetworksService } from '~/core/networks/networks.service';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { EventPayload, PubsubService } from '~/core/pubsub/pubsub.service';
import { getAbiItem } from 'viem';
import { AccountsCacheService } from '../auth/accounts.cache.service';
import { ExpoService } from '~/core/expo/expo.service';
import { BalancesService } from '~/core/balances/balances.service';
import Decimal from 'decimal.js';
import { TokensService } from '~/feat/tokens/tokens.service';
import { ampli } from '~/util/ampli';

export const transferTrigger = (account: UAddress) => `transfer.account.${account}`;
export interface TransferSubscriptionPayload extends EventPayload<'transfer'> {
  transfer: uuid;
  incoming: boolean;
  outgoing: boolean;
  internal: boolean;
}

const transferEvent = getAbiItem({ abi: ERC20, name: 'Transfer' });
const approvalEvent = getAbiItem({ abi: ERC20, name: 'Approval' });

@Injectable()
export class TransfersEvents {
  private log = new Logger(this.constructor.name);

  constructor(
    private db: DatabaseService,
    private events: EventsService,
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
    this.events.onOptimistic(transferEvent, (data) => this.transfer(data));
    this.events.onConfirmed(transferEvent, (data) => this.transfer(data));

    this.events.onOptimistic(approvalEvent, (data) => this.approval(data));
    this.events.onConfirmed(approvalEvent, (data) => this.approval(data));
  }

  private async transfer(
    event: OptimisticEvent<typeof transferEvent> | ConfirmedEvent<typeof transferEvent>,
  ) {
    const { chain, log } = event;

    const [from, to] = [asUAddress(log.args.from, chain), asUAddress(log.args.to, chain)];
    const isAccount = await this.accountsCache.isAccount([from, to]);
    const accounts = [isAccount[0] && from, isAccount[1] && to].filter(isTruthy);
    if (!accounts.length) return;

    const token = asUAddress(normalizeEthAddress(asAddress(log.address)), chain);
    const amount = await this.tokens.asDecimal(token, log.args.value);
    const [localFrom, localTo] = [asAddress(from), asAddress(to)];

    await Promise.all(
      accounts.map(async (account) => {
        const selectedAccount = selectAccount(account);
        const result = event.result
          ? e.assert_single(
              e.select(e.Result, (r) => ({
                filter: and(
                  e.op(r.id, '=', e.uuid(event.result!)),
                  e.op(r.transaction.account, '=', selectedAccount),
                ),
              })),
            )
          : e.cast(e.Result, e.set());

        const transfer = await this.db.query(
          e.select(
            e
              .insert(e.Transfer, {
                account: selectedAccount,
                systxHash: log.transactionHash,
                result,
                logIndex: event.logIndex,
                block: event.block,
                timestamp: event.timestamp,
                confirmed: e.op(e.op('exists', result.is(e.Confirmed)), '??', true),
                from: localFrom,
                to: localTo,
                tokenAddress: token,
                amount:
                  from === to
                    ? '0'
                    : to === account
                      ? amount.toString()
                      : amount.negated().toString(),
                incoming: account === to,
                outgoing: account === from,
                isFeeTransfer: e.op(
                  e.op(result.transaction.paymaster, 'in', e.set(localFrom, localTo)),
                  '??',
                  false,
                ),
              })
              .unlessConflict(),
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

        this.pubsub.event<TransferSubscriptionPayload>(
          transferTrigger(account),
          {
            event: 'transfer',
            transfer: transfer.id,
            incoming: to === account,
            outgoing: from === account,
            internal: transfer.internal,
          },
          (payload) => payload.transfer,
        );

        if (!event.result && !transfer.isFeeTransfer) {
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
    event: OptimisticEvent<typeof approvalEvent> | ConfirmedEvent<typeof approvalEvent>,
  ) {
    const { chain, log } = event;
    const { args } = log;

    const from = asUAddress(args.owner, chain);
    const to = asUAddress(args.spender, chain);

    const isAccount = await this.accountsCache.isAccount([from, to]);
    const accounts = [isAccount[0] && from, isAccount[1] && to].filter(isTruthy);
    if (!accounts.length) return;

    const token = asUAddress(normalizeEthAddress(asAddress(log.address)), chain);
    const amount = await this.tokens.asDecimal(token, args.value);
    const [localFrom, localTo] = [asAddress(from), asAddress(to)];

    await Promise.all(
      accounts.map(async (account) => {
        const selectedAccount = selectAccount(account);
        const result = event.result
          ? e.assert_single(
              e.select(e.Result, (r) => ({
                filter: and(
                  e.op(r.id, '=', e.uuid(event.result!)),
                  e.op(r.transaction.account, '=', selectedAccount),
                ),
              })),
            )
          : e.cast(e.Result, e.set());

        const approval = await this.db.query(
          e
            .insert(e.TransferApproval, {
              account: selectedAccount,
              systxHash: log.transactionHash,
              result,
              logIndex: event.logIndex,
              block: event.block,
              timestamp: event.timestamp,
              confirmed: e.op(e.op('exists', result.is(e.Confirmed)), '??', true),
              from: localFrom,
              to: localTo,
              tokenAddress: token,
              amount:
                from === to
                  ? '0'
                  : to === account
                    ? amount.toString()
                    : amount.negated().toString(),
              incoming: account === to,
              outgoing: account === from,
              isFeeTransfer: e.op(
                e.op(result.transaction.paymaster, 'in', e.set(localFrom, localTo)),
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
          filter: e.op('exists', approver.details.pushToken),
          pushToken: approver.details.pushToken,
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
