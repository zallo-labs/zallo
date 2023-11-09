import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TokensInput, UpsertTokenInput } from './tokens.input';
import { Scope, ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Address, ERC20_ABI, isAddress } from 'lib';
import { and, or } from '../database/database.util';
import { ProviderService } from '../util/provider/provider.service';
import { UserInputError } from '@nestjs/apollo';
import { OrderByObjExpr } from '~/edgeql-js/select';

@Injectable()
export class TokensService {
  constructor(
    private db: DatabaseService,
    private provider: ProviderService,
  ) {}

  async selectUnique(id: uuid | Address, shape?: ShapeFunc<typeof e.Token>) {
    return this.db.query(
      e.assert_single(
        e.select(e.Token, (t) => ({
          filter: isAddress(id) ? e.op(t.address, '=', id) : e.op(t.id, '=', e.uuid(id)),
          limit: 1,
          order_by: preferUserToken(t),
          ...shape?.(t),
        })),
      ),
    );
  }

  async select({ address, query, feeToken }: TokensInput = {}, shape?: ShapeFunc<typeof e.Token>) {
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

  async remove(address: Address) {
    return this.db.query(
      e.delete(e.Token, () => ({
        filter_single: { address, user: e.global.current_user },
      })).id,
    );
  }

  async getTokenMetadata(address: Address) {
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

    const [name, symbol, decimals] = await this.provider.client.multicall({
      contracts: [
        {
          abi: ERC20_ABI,
          address,
          functionName: 'name',
        },
        {
          abi: ERC20_ABI,
          address,
          functionName: 'symbol',
        },
        {
          abi: ERC20_ABI,
          address,
          functionName: 'decimals',
        },
      ],
    });

    return {
      ethereumAddress: null,
      name: name.result,
      symbol: symbol.result,
      decimals: decimals.result,
      isFeeToken: false,
      iconUri: null,
    };
  }
}

function preferUserToken(t: Scope<typeof e.Token>): OrderByObjExpr {
  return {
    expression: e.op('exists', t.user),
    direction: e.DESC,
  };
}

function userTokens() {
  const grouped = e.group(e.Token, (t) => ({
    by: { address: t.address },
  }));

  return e.with(
    [grouped],
    e.select(
      e.select(grouped, () => ({
        elements: (t) => ({
          order_by: {
            expression: e.op('exists', t.user),
            direction: e.DESC,
          },
          limit: 1,
        }),
      })).elements,
    ),
  ) as any as typeof e.Token;
}
