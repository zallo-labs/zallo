import { Injectable } from '@nestjs/common';
import { UAddress, isUAddress } from 'lib';
import { ShapeFunc } from '../database/database.select';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { ContactsInput, UpsertContactInput } from './contacts.input';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { and, or } from '../database/database.util';

type UniqueContact = uuid | UAddress;

export const selectContact = (c: UniqueContact) => {
  return e.select(e.Contact, () => ({
    filter_single: isUAddress(c) ? { user: e.global.current_user, address: c } : { id: c },
  }));
};

@Injectable()
export class ContactsService {
  constructor(private db: DatabaseService) {}

  async selectUnique(id: UniqueContact, shape?: ShapeFunc<typeof e.Contact>) {
    return this.db.query(
      e.select(e.Contact, (c) => ({
        filter_single: isUAddress(id) ? { user: e.global.current_user, address: id } : { id },
        ...shape?.(c),
      })),
    );
  }

  async select({ query, chain }: ContactsInput, shape?: ShapeFunc<typeof e.Contact>) {
    return e
      .select(e.Contact, (c) => ({
        ...shape?.(c),
        filter: and(
          query && or(e.op(c.address, 'ilike', query), e.op(c.label, 'ilike', query)),
          chain && e.op(c.chain, '=', chain),
        ),
      }))
      .run(this.db.client);
  }

  async upsert({ previousAddress, address, label }: UpsertContactInput) {
    // Ignore leading and trailing whitespace
    label = label.trim();

    // UNLESS CONFLICT ON can only be used on a single property, so (= newAddress OR = previousAddress) nor a simple upsert is  possible
    if (previousAddress && previousAddress !== address) {
      const id = await this.db.query(
        e.update(selectContact(previousAddress), () => ({
          set: { address, label },
        })).id,
      );

      if (id) return id;
    }

    return this.db.query(
      e
        .insert(e.Contact, {
          address,
          label,
        })
        .unlessConflict((c) => ({
          on: e.tuple([c.user, c.address]),
          else: e.update(c, () => ({ set: { label } })),
        })).id,
    );
  }

  async delete(address: UAddress) {
    return this.db.query(e.delete(selectContact(address)).id);
  }

  async label(address: UAddress) {
    return (await this.db.query(e.select(e.label(address)))) || null;
  }
}
