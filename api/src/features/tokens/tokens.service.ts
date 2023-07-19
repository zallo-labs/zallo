import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TokensInput, UpsertTokenInput } from './tokens.input';
import { ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Address, isAddress } from 'lib';
import { or } from '../database/database.util';

@Injectable()
export class TokensService {
  constructor(private db: DatabaseService) {}

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
    return this.db.query(
      e.insert(e.Token, { ...token }).unlessConflict((t) => ({
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
}
