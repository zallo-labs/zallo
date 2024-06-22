import { Injectable } from '@nestjs/common';
import { UAddress, isUAddress } from 'lib';
import { ShapeFunc } from '../../core/database/database.select';
import { DatabaseService } from '../../core/database/database.service';
import e from '~/edgeql-js';
import { ContactsInput, UpsertContactInput } from './contacts.input';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { and, or } from '../../core/database/database.util';

type UniqueContact = uuid | UAddress;

export const selectContact = (id: UniqueContact) =>
  e.assert_single(
    e.select(e.Contact, (c) => ({
      filter: isUAddress(id)
        ? and(e.op(c.address, '=', id), e.op(c.user, '=', e.global.current_user))
        : e.op(c.id, '=', e.uuid(id)),
    })),
  );

@Injectable()
export class ContactsService {
  constructor(private db: DatabaseService) {}

  async selectUnique(id: UniqueContact, shape?: ShapeFunc) {
    return this.db.query(
      e.select(selectContact(id), (c) => ({
        ...shape?.(c),
      })),
    );
  }

  async select({ query, chain }: ContactsInput, shape?: ShapeFunc<typeof e.Contact>) {
    return this.db.queryWith(
      { query: e.optional(e.str), chain: e.optional(e.str) },
      ({ query, chain }) =>
        e.select(e.Contact, (c) => ({
          ...shape?.(c),
          filter: and(
            e.op(or(e.op(c.address, 'ilike', query), e.op(c.name, 'ilike', query)), '??', true),
            e.op(c.chain, '?!=', chain),
          ),
        })),
      { query: query || null, chain },
    );
  }

  async upsert({ previousAddress, address, name: name }: UpsertContactInput) {
    // Ignore leading and trailing whitespace
    name = name.trim();

    // UNLESS CONFLICT ON can only be used on a single property, so (= newAddress OR = previousAddress) nor a simple upsert is  possible
    if (previousAddress && previousAddress !== address) {
      const id = await this.db.query(
        e.update(selectContact(previousAddress), () => ({
          set: { address, name },
        })).id,
      );

      if (id) return id;
    }

    return this.db.query(
      e
        .insert(e.Contact, {
          address,
          name,
        })
        .unlessConflict((c) => ({
          on: e.tuple([c.user, c.address]),
          else: e.update(c, () => ({ set: { name } })),
        })).id,
    );
  }

  async delete(address: UAddress) {
    return this.db.query(e.delete(selectContact(address)).id);
  }

  async label(address: UAddress) {
    return this.db.queryWith({ address: e.UAddress }, ({ address }) => e.select(e.label(address)), {
      address,
    });
  }
}
