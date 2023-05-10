import { Injectable } from '@nestjs/common';
import { Address } from 'lib';
import { ShapeFunc } from '../database/database.select';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { getUser } from '~/request/ctx';
import { UpsertContactArgs } from './contacts.args';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { isAddress } from 'ethers/lib/utils';
import { selectUser } from '../users/users.service';
import { UserInputError } from 'apollo-server-core';

type UniqueContact = uuid | Address;

export const uniqueContact = (u: UniqueContact) =>
  e.shape(e.Contact, () => ({
    filter_single: isAddress(u) ? { user: selectUser(getUser()), address: u } : { id: u },
  }));

@Injectable()
export class ContactsService {
  constructor(private db: DatabaseService) {}

  async selectUnique(id: UniqueContact, shape?: ShapeFunc<typeof e.Contact>) {
    return e
      .select(e.Contact, (c) => ({
        ...shape?.(c),
        ...uniqueContact(id)(c),
      }))
      .run(this.db.client);
  }

  async select(shape?: ShapeFunc<typeof e.Contact>) {
    const contacts = await e
      .select(e.Contact, (c) => ({
        ...shape?.(c),
      }))
      .run(this.db.client);

    const accounts = await e
      .select(e.Account, (a) => ({
        filter: e.op(a.address, 'not in', e.cast(e.str, e.set(...contacts.map((c) => c.address)))),
        id: true,
        address: true,
        name: true,
      }))
      .run(this.db.client);

    return [...contacts, ...accounts];
  }

  async upsert({ previousAddress, address, name }: UpsertContactArgs) {
    // Ignore leading and trailing whitespace
    name = name.trim();

    // UNLESS CONFLICT ON can only be used on a single property, so (= newAddress OR = previousAddress) nor a simple upsert is  possible
    if (previousAddress && previousAddress !== address) {
      const id = await this.db.query(
        e.update(e.Contact, (c) => ({
          ...uniqueContact(previousAddress)(c),
          set: {
            address,
            name,
          },
        })).id,
      );

      if (id) return id;
    }

    let id = await this.db.query(
      e
        .insert(e.Contact, {
          user: selectUser(getUser()),
          address,
          name,
        })
        .unlessConflict().id,
    );
    if (id) return id;

    id = await this.db.query(
      e.update(e.Contact, (c) => ({
        ...uniqueContact(address)(c),
        set: { name },
      })).id,
    );
    if (!id) throw new UserInputError('Upsert failed');

    return id;
  }

  async delete(address: Address) {
    const id = await this.db.query(e.delete(e.Contact, uniqueContact(address))?.id);
    if (!id) throw new UserInputError('Contact not found');

    return id;
  }
}
