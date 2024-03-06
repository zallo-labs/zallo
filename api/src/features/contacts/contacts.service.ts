import { Injectable } from '@nestjs/common';
import { Address, UAddress, asAddress, isUAddress } from 'lib';
import { ShapeFunc } from '../database/database.select';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { ContactsInput, UpsertContactInput } from './contacts.input';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { and, or } from '../database/database.util';
import { CONFIG } from '~/config';

type UniqueContact = uuid | UAddress;

export const selectContact = (c: UniqueContact) => {
  return e.select(e.Contact, () => ({
    filter_single: isUAddress(c) ? { user: e.global.current_user, address: c } : { id: c },
  }));
};

@Injectable()
export class ContactsService {
  private hardcodedContracts: Record<Address, string>;

  constructor(private db: DatabaseService) {
    this.hardcodedContracts = {
      // [this.networks.walletAddress]: 'Zallo',
      // mainnet TODO: handle chain
      '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295': 'SyncSwap', // SyncSwap router - mainnet
      '0xB3b7fCbb8Db37bC6f572634299A58f51622A847e': 'SyncSwap', // SyncSwap router - testnet
    };
  }

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
    const contact = e.select(e.Contact, () => ({
      filter_single: { user: e.global.current_user, address },
      label: true,
    })).label;

    const accountLabel = e.select(e.Account, () => ({
      filter_single: { address },
      label: true,
    })).label;
    const account = e.op(
      e.op(accountLabel, '++', CONFIG.ensSuffix),
      'if',
      e.op('exists', accountLabel),
      'else',
      e.cast(e.str, e.set()),
    );

    const token = e.assert_single(
      e.select(e.Token, (t) => ({
        filter: e.op(t.address, '=', address),
        limit: 1,
        name: true,
      })).name,
    );

    const approver = e.select(e.Approver, () => ({
      filter_single: { address: asAddress(address) },
      label: true,
    })).label;

    const r = await this.db.query(
      e.select(e.op(e.op(e.op(contact, '??', account), '??', token), '??', approver)),
    );

    return r ?? this.hardcodedContracts[address];
  }
}
