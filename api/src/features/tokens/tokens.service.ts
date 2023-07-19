import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TokensInput, UpsertTokenInput } from './tokens.input';
import { ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Address, ERC20_ABI, isAddress } from 'lib';
import { or } from '../database/database.util';
import { ProviderService } from '../util/provider/provider.service';
import { UserInputError } from '@nestjs/apollo';

@Injectable()
export class TokensService {
  constructor(private db: DatabaseService, private provider: ProviderService) {}

  async selectUnique(id: uuid | Address, shape?: ShapeFunc<typeof e.Token>) {
    return this.db.query(
      e.assert_single(
        e.select(e.Token, (t) => ({
          filter: e.op(isAddress(id) ? t.address : t.id, '=', id),
          limit: 1,
          order_by: e.op('exists', t.user),
          ...shape?.(t),
        })),
      ),
    );
  }

  async select({ query }: TokensInput = {}, shape?: ShapeFunc<typeof e.Token>) {
    const tokens = await this.db.query(
      e.select(e.Token, (t) => ({
        ...shape?.(t),
        address: true,
        filter: query
          ? or(
              e.op(t.address, 'ilike', query),
              e.op(t.name, 'ilike', query),
              e.op(t.symbol, 'ilike', query),
            )
          : undefined,
        order_by: [
          {
            expression: t.address,
            direction: e.ASC,
          },
          {
            // user exists first
            expression: e.op('exists', t.user),
            direction: e.DESC,
          },
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

  private async getTokenMetadata(address: Address) {
    const t = await this.db.query(
      e.assert_single(
        e.select(e.Token, (t) => ({
          filter: e.op(t.address, '=', address),
          limit: 1,
          ethereumAddress: true,
          name: true,
          symbol: true,
          decimals: true,
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
    };
  }
}
