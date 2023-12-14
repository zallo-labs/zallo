import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TokensInput, UpsertTokenInput } from './tokens.input';
import { Scope, ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { UAddress, asAddress, asDecimal, asFp, isUAddress } from 'lib';
import { ERC20, TOKENS, flattenToken } from 'lib/dapps';
import { and, or } from '../database/database.util';
import { NetworksService } from '../util/networks/networks.service';
import { UserInputError } from '@nestjs/apollo';
import { OrderByObjExpr } from '~/edgeql-js/select';
import { TokenMetadata } from '~/features/tokens/tokens.model';
import Decimal from 'decimal.js';

@Injectable()
export class TokensService {
  private decimalsCache = new Map<UAddress, number>(
    TOKENS.flatMap(flattenToken).map((t) => [t.address, t.decimals]),
  );
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
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

    const c = { ...metadata, ...token };
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

    const [name, symbol, decimals] = await this.networks.for(address).multicall({
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

    const decimals = await this.networks.for(token).readContract({
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
}

export function preferUserToken(t: Scope<typeof e.Token>): OrderByObjExpr {
  return {
    expression: e.op('exists', t.user),
    direction: e.DESC,
  };
}
