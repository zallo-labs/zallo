import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { BalanceInput, SpendingInput, TokensInput, UpsertTokenInput } from './tokens.input';
import { Scope, ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { UAddress, asAddress, asDecimal, asFp, asUAddress, isUAddress } from 'lib';
import { ERC20, TOKENS, flattenToken } from 'lib/dapps';
import { and, or } from '../database/database.util';
import { NetworksService } from '../util/networks/networks.service';
import { UserInputError } from '@nestjs/apollo';
import { OrderByObjExpr } from '~/edgeql-js/select';
import { TokenMetadata } from '~/features/tokens/tokens.model';
import Decimal from 'decimal.js';
import { selectAccount } from '../accounts/accounts.util';
import { TokenSpending } from './spending.model';
import { Transferlike } from '../transfers/transfers.model';
import { getUserCtx } from '~/request/ctx';
import { BalancesService } from '../util/balances/balances.service';
import { selectTransaction } from '../transactions/transactions.service';
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

  async selectUnique(id: uuid | UAddress, shape?: ShapeFunc<typeof e.Token>) {
    return this.db.query(
      e.assert_single(
        e.select(e.Token, (t) => ({
          filter: isUAddress(id) ? e.op(t.address, '=', id) : e.op(t.id, '=', e.uuid(id)),
          limit: 1,
          order_by: preferUserToken(t),
          ...shape?.(t),
        })),
      ),
    );
  }

  async select(
    { address, query, feeToken, chain }: TokensInput = {},
    shape?: ShapeFunc<typeof e.Token>,
  ) {
    const tokens = await this.db.query(
      e.select(e.Token, (t) => ({
        ...shape?.(t),
        address: true,
        filter: and(
          address && address.length > 0 && e.op(t.address, 'in', e.set(...address)),
          query &&
            or(
              e.op(t.address, 'ilike', query),
              e.op(t.name, 'ilike', query),
              e.op(t.symbol, 'ilike', query),
            ),
          feeToken !== undefined && e.op(t.isFeeToken, '=', feeToken),
          chain && e.op(t.chain, '=', chain),
        ),
        order_by: [
          {
            expression: t.address,
            direction: e.ASC,
          },
          preferUserToken(t),
        ],
      })),
    );

    // Filter out duplicate allowlisted (no user) tokens
    return tokens.filter((t, i) => i === 0 || t.address !== tokens[i - 1].address);
  }

  async upsert(token: UpsertTokenInput) {
    const metadata = await this.getTokenMetadata(token.address);

    const c = {
      name: metadata.name,
      symbol: metadata.symbol,
      decimals: metadata.decimals,
      ...token,
    };
    if (!c.name) throw new UserInputError('Name could not be detected so is required');
    if (!c.symbol) throw new UserInputError('Symbol could not be detected so is required');
    if (c.decimals === undefined)
      throw new UserInputError('Symbol could not be detected so is required');

    return this.db.query(
      e
        .insert(e.Token, {
          ...c,
          name: c.name,
          symbol: c.symbol,
          decimals: c.decimals,
        })
        .unlessConflict((t) => ({
          on: e.tuple([t.user, t.address]),
          else: e.update(t, () => ({ set: token })),
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
          filter: e.op(e.op(t.address, '=', address), 'and', e.op('not', e.op('exists', t.user))),
          limit: 1,
          ethereumAddress: true,
          name: true,
          symbol: true,
          decimals: true,
          isFeeToken: true,
          iconUri: true,
        })),
      ),
    );
    if (t) return t;

    const [name, symbol, decimals] = await this.networks.get(address).multicall({
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
        {
          abi: ERC20,
          address: asAddress(address),
          functionName: 'decimals',
        },
      ],
    });

    return {
      id: `TokenMetadata:${address}`,
      name: name.result,
      symbol: symbol.result,
      decimals: decimals.result,
      iconUri: null,
    } satisfies TokenMetadata;
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

    const balance = await this.asDecimal(
      token,
      await this.balances.balance({ account, token: asAddress(token) }),
    );
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

  private async policySpending(
    token: UAddress,
    policy: SelectedPolicies,
    sinceParam?: Date,
    shape?: ShapeFunc,
  ): Promise<TokenSpending> {
    if (!policy && !sinceParam) throw new UserInputError('policy or since is required');

    // May technically be multiple, but only used when there's one (when policyKey is provided)
    const limit = e.assert_single(
      e.select(policy.state.transfers.limits, (l) => ({
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
      transfers: r.transfers as Transferlike[],
      since: r.since ?? new Date(),
      spent,
      limit: limit_,
      remaining: limit_ ? limit_.minus(spent) : undefined,
    };
  }
}

export function preferUserToken(t: Scope<typeof e.Token>): OrderByObjExpr {
  return {
    expression: e.op('exists', t.user),
    direction: e.DESC,
  };
}
