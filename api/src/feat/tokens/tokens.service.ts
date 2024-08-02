import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/core/database';
import { BalanceInput, SpendingInput, TokensInput, UpsertTokenInput } from './tokens.input';
import { Scope, ShapeFunc } from '~/core/database';
import e from '~/edgeql-js';
import { UAddress, asAddress, asDecimal, asFp, asHex, asUAddress } from 'lib';
import { ERC20, TOKENS, flattenToken } from 'lib/dapps';
import { and, or } from '~/core/database';
import { NetworksService } from '~/core/networks/networks.service';
import { UserInputError } from '@nestjs/apollo';
import { OrderByObjExpr } from '~/edgeql-js/select';
import Decimal from 'decimal.js';
import { selectAccount } from '../accounts/accounts.util';
import { TokenSpending } from './spending.model';
import { Transferlike } from '../transfers/transfers.model';
import { getUserCtx } from '~/core/context';
import { BalancesService } from '~/core/balances/balances.service';
import { selectTransaction } from '../transactions/transactions.util';
import { SelectedPolicies } from '../policies/policies.util';

@Injectable()
export class TokensService {
  private decimalsCache = new Map<UAddress, number>(
    TOKENS.flatMap(flattenToken).map((t) => [t.address, t.decimals]),
  );
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private balances: BalancesService,
  ) {}

  async selectUnique(address: UAddress, shape?: ShapeFunc<typeof e.Token>) {
    return this.db.queryWith(
      { address: e.UAddress },
      ({ address }) =>
        e.select(e.token(address), (t) => ({
          ...shape?.(t),
        })),
      { address },
    );
  }

  async select(
    { address, query, feeToken, chain }: TokensInput = {},
    shape?: ShapeFunc<typeof e.Token>,
  ) {
    const tokens = await this.db.queryWith(
      {
        address: e.optional(e.array(e.UAddress)),
        query: e.optional(e.str),
        feeToken: e.optional(e.bool),
        chain: e.optional(e.str),
      },
      ({ address, query, feeToken, chain }) =>
        e.select(e.Token, (t) => ({
          ...shape?.(t),
          address: true,
          filter: and(
            e.op(
              e.op(t.address, 'in', e.array_unpack(address)),
              'if',
              e.op('exists', address),
              'else',
              true,
            ),
            e.op(
              or(
                e.op(t.address, 'ilike', query),
                e.op(t.name, 'ilike', query),
                e.op(t.symbol, 'ilike', query),
              ),
              'if',
              e.op('exists', query),
              'else',
              true,
            ),
            e.op(e.op(t.isFeeToken, '=', feeToken), 'if', e.op('exists', feeToken), 'else', true),
            e.op(e.op(t.chain, '=', chain), 'if', e.op('exists', chain), 'else', true),
          ),
          order_by: [
            {
              expression: t.address,
              direction: e.ASC,
            },
            preferUserToken(t),
          ],
        })),
      { address, query: query || undefined, feeToken, chain },
    );

    // Filter out duplicate allowlisted (no user) tokens
    return tokens.filter((t, i) => i === 0 || t.address !== tokens[i - 1].address);
  }

  async upsert(input: UpsertTokenInput) {
    const metadata = await this.getTokenMetadata(input.address);
    if (!metadata) throw new UserInputError('Token must conform to ERC20 standard');

    return this.db.query(
      e
        .insert(e.Token, {
          ...metadata,
          ...input,
          units: (input.units ?? metadata.units)?.sort((a, b) => a.decimals - b.decimals),
        })
        .unlessConflict((t) => ({
          on: e.tuple([t.user, t.address]),
          else: e.update(t, () => ({
            set: {
              ...input,
              ...(input.units !== undefined && {
                units: input.units ? input.units.sort((a, b) => a.decimals - b.decimals) : null,
              }),
            },
          })),
        })),
    );
  }

  async remove(address: UAddress) {
    return this.db.query(
      e.delete(e.Token, () => ({
        filter_single: { address, user: e.global.current_user },
      })).id,
    );
  }

  async getTokenMetadata(address: UAddress) {
    const t = await this.db.query(
      e.assert_single(
        e.select(e.Token, (t) => ({
          filter: e.op(e.op(t.address, '=', address), 'and', t.isSystem),
          limit: 1,
          name: true,
          symbol: true,
          decimals: true,
          icon: true,
          isFeeToken: true,
          pythUsdPriceId: true,
          units: true,
        })),
      ),
    );
    if (t) return { ...t, pythUsdPriceId: asHex(t.pythUsdPriceId) };

    const [name, symbol] = await this.networks.get(address).multicall({
      contracts: [
        {
          abi: ERC20,
          address: asAddress(address),
          functionName: 'name',
        },
        {
          abi: ERC20,
          address: asAddress(address),
          functionName: 'symbol',
        },
      ],
    });

    if (!name.result || !symbol.result) return null;

    return {
      name: name.result,
      symbol: symbol.result,
      decimals: await this.decimals(address),
      icon: null,
      units: [],
    };
  }

  async decimals(token: UAddress): Promise<number> {
    const cached = this.decimalsCache.get(token);
    if (cached !== undefined) return cached;

    const decimals = await this.networks.get(token).readContract({
      address: asAddress(token),
      abi: ERC20,
      functionName: 'decimals',
    });
    this.decimalsCache.set(token, decimals);

    return decimals;
  }

  async asDecimal(token: UAddress, amount: bigint): Promise<Decimal> {
    return asDecimal(amount, await this.decimals(token));
  }

  async asFp(token: UAddress, amount: Decimal): Promise<bigint> {
    return asFp(amount, await this.decimals(token));
  }

  async balance(token: UAddress, { account, transaction }: BalanceInput): Promise<Decimal> {
    if (!account) {
      const accounts = getUserCtx().accounts;
      if (accounts.length === 1) account = accounts[0].address;

      if (!transaction) throw new UserInputError('account or transaction is required');

      account = asUAddress(
        await this.db.query(e.assert_exists(selectTransaction(transaction).account.address)),
      );
    }

    const balance = await this.asDecimal(token, await this.balances.balance({ account, token }));
    if (balance.eq(0)) return balance;

    const limitRemaining =
      transaction &&
      (
        await this.policySpending(
          token,
          selectTransaction(transaction).policy as unknown as SelectedPolicies,
        )
      ).remaining;

    return limitRemaining ? Decimal.min(balance, limitRemaining) : balance;
  }

  async spending(token: UAddress, input: SpendingInput, shape?: ShapeFunc): Promise<TokenSpending> {
    const policy = e.select(e.Policy, (p) => ({
      filter: and(
        e.op(p.account, '=', selectAccount(input.account)),
        input.policyKey !== undefined && e.op(p.key, '=', input.policyKey),
      ),
    })) as unknown as SelectedPolicies;

    return this.policySpending(token, policy, input.since, shape);
  }

  async policySpending(
    token: UAddress,
    policy: SelectedPolicies,
    sinceParam?: Date,
    shape?: ShapeFunc,
  ): Promise<TokenSpending> {
    if (!policy && !sinceParam) throw new UserInputError('policy or since is required');

    // May technically be multiple, but only used when there's one (when policyKey is provided)
    const limit = e.assert_single(
      e.select(policy.transfers.limits, (l) => ({
        filter: e.op(l.token, '=', asAddress(token)),
        amount: true,
        duration: true,
      })),
    );

    const now = e.datetime_get(e.datetime_of_transaction(), 'epochseconds');
    const since = sinceParam
      ? e.datetime(sinceParam)
      : e.with([now], e.select(e.to_datetime(e.op(now, '-', e.op(now, '%', limit.duration))))); // {} if limit is {}

    const transfers = e.select(
      e.op(e.Transferlike, 'if', e.op('exists', since), 'else', e.cast(e.Transferlike, e.set())),
      (t) => ({
        filter: and(
          e.op(t.spentBy, '=', policy),
          e.op(t.tokenAddress, '=', token),
          e.op(t.timestamp, '>=', since),
          t.confirmed,
        ),
        ...shape?.(t, 'transfers'),
        amount: true,
      }),
    );

    const r = await this.db.query(
      e.with(
        [policy, limit],
        e.select({
          transfers: shape?.includes?.('transfers') ? transfers : e.cast(e.Transfer, e.set()),
          spent: e.op(e.sum(transfers.amount), '*', e.decimal('-1')),
          limitAmount: limit.amount,
          since,
        }),
      ),
    );

    const spent = new Decimal(r.spent);
    const limit_ = r.limitAmount ? await this.asDecimal(token, r.limitAmount) : undefined;

    return {
      transfers: r.transfers as unknown as Transferlike[],
      since: r.since ?? new Date(),
      spent,
      limit: limit_,
      remaining: limit_ ? limit_.minus(spent) : undefined,
    };
  }
}

export function preferUserToken(t: Scope<typeof e.Token>): OrderByObjExpr {
  return {
    expression: e.op(
      e.op('exists', t.user),
      'if',
      e.op('exists', e.global.current_user),
      'else',
      t.isSystem,
    ),
    direction: e.DESC,
  };
}
